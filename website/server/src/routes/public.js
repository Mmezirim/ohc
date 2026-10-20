import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isDbAvailable, query } from '../db.js';
import * as seed from '../data/seed.js';
import { getSetting, getSiteContent } from '../lib/content.js';
import { getSermons } from '../lib/youtube.js';
import { isBot, validateComment, validateEnquiry, validateVisit } from '../lib/validate.js';
import { notifyEnquiry, notifyVisit } from '../lib/mailer.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again in a few minutes.' },
});

const requireDb = (req, res, next) => {
  if (isDbAvailable()) return next();
  res.status(503).json({ error: 'This form is temporarily unavailable. Please try again later.' });
};

router.get('/health', (req, res) => res.json({ ok: true, db: isDbAvailable() }));

router.get(
  '/content',
  wrap(async (req, res) => {
    res.set('Cache-Control', 'public, max-age=60');
    res.json(await getSiteContent());
  }),
);

router.get(
  '/sermons',
  wrap(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 50);
    const channel = process.env.YOUTUBE_CHANNEL_ID || (await getSetting('youtube_channel_id'));
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ channelId: channel, items: await getSermons(channel, limit) });
  }),
);

// ---- Blog posts --------------------------------------------------------------

const POST_FIELDS = 'id, slug, title, category, author, featured_image, youtube_id, body, published_at';

const shapePost = (p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category || 'Uncategorized',
  author: p.author || 'Oak House Church',
  featuredImage: p.featured_image,
  youtubeId: p.youtube_id,
  body: p.body || '',
  publishedAt: p.published_at,
});

router.get(
  '/posts',
  wrap(async (req, res) => {
    const rows = isDbAvailable()
      ? await query(`SELECT ${POST_FIELDS} FROM posts ORDER BY published_at DESC`)
      : seed.posts;
    res.json(rows.map(shapePost));
  }),
);

router.get(
  '/posts/:slug',
  wrap(async (req, res) => {
    let post;
    let comments = [];
    if (isDbAvailable()) {
      [post] = await query(`SELECT ${POST_FIELDS} FROM posts WHERE slug = ?`, [req.params.slug]);
      if (post) {
        comments = await query(
          'SELECT id, name, website, body, created_at FROM comments WHERE post_id = ? AND approved = 1 ORDER BY created_at',
          [post.id],
        );
      }
    } else {
      post = seed.posts.find((p) => p.slug === req.params.slug);
    }
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const all = isDbAvailable()
      ? await query('SELECT slug, title, published_at FROM posts ORDER BY published_at DESC')
      : seed.posts;
    const i = all.findIndex((p) => p.slug === post.slug);
    const nav = (p) => (p ? { slug: p.slug, title: p.title } : null);

    res.json({
      ...shapePost(post),
      comments: comments.map((c) => ({ id: c.id, name: c.name, website: c.website, body: c.body, createdAt: c.created_at })),
      newer: nav(all[i - 1]),
      older: nav(all[i + 1]),
    });
  }),
);

router.post(
  '/posts/:slug/comments',
  formLimiter,
  requireDb,
  wrap(async (req, res) => {
    if (isBot(req.body)) return res.status(201).json({ ok: true, pending: true });
    const data = validateComment(req.body || {});
    const [post] = await query('SELECT id FROM posts WHERE slug = ?', [req.params.slug]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await query('INSERT INTO comments SET ?', [{ ...data, post_id: post.id, ip: req.ip }]);
    res.status(201).json({ ok: true, pending: true });
  }),
);

// ---- Plan Your Visit -----------------------------------------------------------

router.post(
  '/visits',
  formLimiter,
  requireDb,
  wrap(async (req, res) => {
    if (isBot(req.body)) return res.status(201).json({ ok: true });
    const data = validateVisit(req.body || {});
    await query('INSERT INTO visit_requests SET ?', [{ ...data, ip: req.ip }]);
    notifyVisit(data).catch((err) => console.warn('[mail] visit notification failed:', err.message));
    res.status(201).json({ ok: true });
  }),
);

// ---- Contact enquiries ---------------------------------------------------------

router.post(
  '/enquiries',
  formLimiter,
  requireDb,
  wrap(async (req, res) => {
    if (isBot(req.body)) return res.status(201).json({ ok: true });
    const data = validateEnquiry(req.body || {});
    await query('INSERT INTO enquiries SET ?', [{ ...data, ip: req.ip }]);
    notifyEnquiry(data).catch((err) => console.warn('[mail] enquiry notification failed:', err.message));
    res.status(201).json({ ok: true });
  }),
);

export default router;
