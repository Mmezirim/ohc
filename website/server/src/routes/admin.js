import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import QRCode from 'qrcode';
import { isDbAvailable, query } from '../db.js';
import { badRequest } from '../lib/validate.js';
import { clearContentCache, getSetting } from '../lib/content.js';
import { refreshSermons } from '../lib/youtube.js';
import { audit } from '../admin/audit.js';
import { buildRecord, presentRow } from '../admin/fields.js';
import { renderMarkdown } from '../admin/markdown.js';
import { PAGE_FIELDS, PAGES, RESOURCES, SETTINGS, SETTING_KEYS } from '../admin/resources.js';
import {
  burnPasswordCheck,
  hashPassword,
  newTotpSecret,
  passwordProblem,
  totpUri,
  verifyPassword,
  verifyTotp,
} from '../admin/security.js';
import { createSession, destroySession, destroyUserSessions, purgeExpiredSessions, requireAuth } from '../admin/session.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const here = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(here, '..', '..', 'uploads'));

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

// Admin responses must never be cached by browsers or proxies.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

router.use((req, res, next) => {
  if (isDbAvailable()) return next();
  res.status(503).json({ error: 'The database is unavailable, so the admin panel is offline.' });
});

const toSql = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, totpEnabled: Boolean(u.totp_enabled) });

// ---- Authentication -----------------------------------------------------------------------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts from this network. Please wait 15 minutes and try again.' },
});

function sameOriginOnly(req, res, next) {
  const origin = req.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== (req.get('x-forwarded-host') || req.get('host'))) {
        return res.status(403).json({ error: 'Request blocked (cross-origin).' });
      }
    } catch {
      return res.status(403).json({ error: 'Request blocked.' });
    }
  }
  if (!req.is('application/json')) return res.status(415).json({ error: 'Unsupported request.' });
  next();
}

router.post(
  '/auth/login',
  loginLimiter,
  sameOriginOnly,
  wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 190);
    const password = String(req.body?.password || '').slice(0, 200);
    const code = String(req.body?.code || '');
    const fail = (status = 401, message = 'Email or password is incorrect.') => res.status(status).json({ error: message });

    if (!email || !password) return fail(400, 'Enter your email and password.');
    const [user] = await query('SELECT *, locked_until > UTC_TIMESTAMP() AS is_locked FROM admin_users WHERE email = ?', [email]);
    if (!user || !user.active) {
      await burnPasswordCheck(password);
      await audit(req, 'login_failed', { details: { email, reason: user ? 'disabled' : 'unknown' }, user: null });
      return fail();
    }
    if (user.is_locked) {
      await burnPasswordCheck(password);
      return fail(429, `Too many failed attempts. This account is locked for up to ${LOCK_MINUTES} minutes.`);
    }

    const recordFailure = async (reason) => {
      const attempts = user.failed_attempts + 1;
      const lock = attempts >= MAX_FAILED;
      await query('UPDATE admin_users SET failed_attempts = ?, locked_until = ? WHERE id = ?', [
        lock ? 0 : attempts,
        lock ? toSql(new Date(Date.now() + LOCK_MINUTES * 60000)) : null,
        user.id,
      ]);
      await audit(req, lock ? 'account_locked' : 'login_failed', { entity: 'admin_users', entityId: user.id, details: { reason }, user });
    };

    if (!(await verifyPassword(password, user.password_hash).catch(() => false))) {
      await recordFailure('password');
      return fail();
    }
    if (user.totp_enabled) {
      if (!code) return res.json({ twoFactorRequired: true });
      if (!verifyTotp(user.totp_secret, code)) {
        await recordFailure('2fa');
        return fail(401, 'That authentication code is not valid. Check your app and try again.');
      }
    }

    await query('UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP() WHERE id = ?', [user.id]);
    await purgeExpiredSessions();
    const csrf = await createSession(req, res, user.id);
    await audit(req, 'login', { entity: 'admin_users', entityId: user.id, user });
    res.json({ user: publicUser(user), csrfToken: csrf });
  }),
);

// ---- First-run setup: only possible while there are no admin accounts at all ----------------------

router.get(
  '/auth/setup-status',
  wrap(async (req, res) => {
    const [{ n }] = await query('SELECT COUNT(*) AS n FROM admin_users');
    res.json({ needsSetup: n === 0 });
  }),
);

router.post(
  '/auth/setup',
  loginLimiter,
  sameOriginOnly,
  wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 190);
    const name = String(req.body?.name || '').trim().slice(0, 120);
    const password = String(req.body?.password || '');
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.';
    if (name.length < 2) errors.name = 'Enter your name.';
    const problem = passwordProblem(password, { email, name });
    if (problem) errors.password = problem;
    if (Object.keys(errors).length) throw badRequest(errors);

    // Atomic: the row is only inserted if the table is still empty, so two people can't both claim it.
    const result = await query(
      `INSERT INTO admin_users (email, name, role, password_hash)
       SELECT ?, ?, 'admin', ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM admin_users)`,
      [email, name, await hashPassword(password)],
    );
    if (!result.affectedRows) return res.status(403).json({ error: 'Setup is already complete. Please sign in.' });

    const user = { id: result.insertId, email, name, role: 'admin', totp_enabled: 0 };
    const csrf = await createSession(req, res, user.id);
    await audit(req, 'first_admin_created', { entity: 'admin_users', entityId: user.id, user });
    res.status(201).json({ user: publicUser(user), csrfToken: csrf });
  }),
);

router.post(
  '/auth/logout',
  requireAuth(),
  wrap(async (req, res) => {
    await audit(req, 'logout');
    await destroySession(req, res);
    res.json({ ok: true });
  }),
);

router.get(
  '/auth/me',
  requireAuth(),
  wrap(async (req, res) => {
    res.json({ user: publicUser(req.admin), csrfToken: req.admin.csrf_token });
  }),
);

router.post(
  '/auth/password',
  requireAuth(),
  wrap(async (req, res) => {
    const { currentPassword = '', newPassword = '' } = req.body || {};
    const [user] = await query('SELECT * FROM admin_users WHERE id = ?', [req.admin.id]);
    if (!(await verifyPassword(String(currentPassword), user.password_hash).catch(() => false))) {
      throw badRequest({ currentPassword: 'Your current password is incorrect.' });
    }
    const problem = passwordProblem(newPassword, user);
    if (problem) throw badRequest({ newPassword: problem });
    if (await verifyPassword(newPassword, user.password_hash)) throw badRequest({ newPassword: 'Choose a password you haven’t used here before.' });
    await query('UPDATE admin_users SET password_hash = ?, password_changed_at = UTC_TIMESTAMP() WHERE id = ?', [await hashPassword(newPassword), user.id]);
    await destroyUserSessions(user.id, req.admin.session_id); // sign out everywhere else
    await audit(req, 'password_changed', { entity: 'admin_users', entityId: user.id });
    res.json({ ok: true });
  }),
);

router.get(
  '/auth/sessions',
  requireAuth(),
  wrap(async (req, res) => {
    const rows = await query(
      'SELECT id, ip, user_agent, created_at, last_seen FROM admin_sessions WHERE user_id = ? ORDER BY last_seen DESC',
      [req.admin.id],
    );
    res.json(rows.map((r) => ({ ip: r.ip, userAgent: r.user_agent, createdAt: r.created_at, lastSeen: r.last_seen, current: r.id === req.admin.session_id })));
  }),
);

router.post(
  '/auth/sessions/revoke-others',
  requireAuth(),
  wrap(async (req, res) => {
    await destroyUserSessions(req.admin.id, req.admin.session_id);
    await audit(req, 'sessions_revoked');
    res.json({ ok: true });
  }),
);

// Two-factor: setup stores a pending secret; it only takes effect once a valid code is confirmed.
router.post(
  '/auth/2fa/setup',
  requireAuth(),
  wrap(async (req, res) => {
    if (req.admin.totp_enabled) return res.status(400).json({ error: 'Two-factor authentication is already on.' });
    const secret = newTotpSecret();
    await query('UPDATE admin_users SET totp_secret = ? WHERE id = ?', [secret, req.admin.id]);
    const uri = totpUri(secret, req.admin.email);
    res.json({ secret, uri, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: '#26132E' } }) });
  }),
);

router.post(
  '/auth/2fa/enable',
  requireAuth(),
  wrap(async (req, res) => {
    const [user] = await query('SELECT totp_secret FROM admin_users WHERE id = ?', [req.admin.id]);
    if (!user.totp_secret || !verifyTotp(user.totp_secret, req.body?.code)) throw badRequest({ code: 'That code is not valid. Check the time on your phone and try again.' });
    await query('UPDATE admin_users SET totp_enabled = 1 WHERE id = ?', [req.admin.id]);
    await destroyUserSessions(req.admin.id, req.admin.session_id);
    await audit(req, '2fa_enabled', { entity: 'admin_users', entityId: req.admin.id });
    res.json({ ok: true });
  }),
);

router.post(
  '/auth/2fa/disable',
  requireAuth(),
  wrap(async (req, res) => {
    const [user] = await query('SELECT * FROM admin_users WHERE id = ?', [req.admin.id]);
    if (!(await verifyPassword(String(req.body?.password || ''), user.password_hash).catch(() => false))) throw badRequest({ password: 'Your password is incorrect.' });
    if (!verifyTotp(user.totp_secret, req.body?.code)) throw badRequest({ code: 'That code is not valid.' });
    await query('UPDATE admin_users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?', [user.id]);
    await audit(req, '2fa_disabled', { entity: 'admin_users', entityId: user.id });
    res.json({ ok: true });
  }),
);

// ---- Everything below requires a signed-in user ----------------------------------------------
router.use(requireAuth());

router.get('/schema', (req, res) => {
  res.json({
    resources: Object.entries(RESOURCES).map(([key, r]) => ({
      key,
      label: r.label,
      singular: r.singular,
      titleField: r.titleField,
      subtitleField: r.subtitleField,
      imageField: r.imageField,
      fields: r.fields,
    })),
    settings: SETTINGS,
    pages: PAGES.map(([key, label]) => ({ key, label })),
    pageFields: PAGE_FIELDS.map(([name, label, type]) => ({ name, label, type })),
  });
});

router.get(
  '/dashboard',
  wrap(async (req, res) => {
    const count = async (sql) => (await query(sql))[0].n;
    const [enquiries, visits, comments, media, recent] = await Promise.all([
      count('SELECT COUNT(*) AS n FROM enquiries WHERE handled = 0'),
      count('SELECT COUNT(*) AS n FROM visit_requests WHERE handled = 0'),
      count('SELECT COUNT(*) AS n FROM comments WHERE approved = 0'),
      count('SELECT COUNT(*) AS n FROM media'),
      query('SELECT id, full_name, intent, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5'),
    ]);
    const entries = Object.entries(RESOURCES);
    const counts = await Promise.all(entries.map(([, r]) => count(`SELECT COUNT(*) AS n FROM \`${r.table}\``)));
    const content = Object.fromEntries(entries.map(([key], i) => [key, counts[i]]));
    res.json({ open: { enquiries, visits, comments }, media, content, recentEnquiries: recent });
  }),
);

// ---- Content (generic CRUD over the registry) -------------------------------------------------

function resourceFor(req) {
  const r = Object.hasOwn(RESOURCES, req.params.resource) ? RESOURCES[req.params.resource] : null;
  if (!r) {
    const err = new Error('Unknown content type.');
    err.status = 404;
    throw err;
  }
  return r;
}

function finaliseRecord(r, data) {
  if (r.table === 'posts' && 'body_markdown' in data) data.body = renderMarkdown(data.body_markdown || '');
  return data;
}

function friendlyDbError(err) {
  if (err.code === 'ER_DUP_ENTRY') {
    const e = badRequest({ slug: 'That slug is already used. Choose a different one.' });
    e.status = 409;
    return e;
  }
  return err;
}

router.get(
  '/content/:resource',
  wrap(async (req, res) => {
    const r = resourceFor(req);
    const rows = await query(`SELECT * FROM \`${r.table}\` ORDER BY ${r.orderBy}`);
    res.json(rows.map((row) => presentRow(r, row)));
  }),
);

router.post(
  '/content/:resource',
  wrap(async (req, res) => {
    const r = resourceFor(req);
    const data = finaliseRecord(r, buildRecord(r, req.body || {}));
    const result = await query(`INSERT INTO \`${r.table}\` SET ?`, [data]).catch((e) => {
      throw friendlyDbError(e);
    });
    clearContentCache();
    await audit(req, 'create', { entity: r.table, entityId: result.insertId, details: { title: data[r.titleField] } });
    const [row] = await query(`SELECT * FROM \`${r.table}\` WHERE id = ?`, [result.insertId]);
    res.status(201).json(presentRow(r, row));
  }),
);

router.put(
  '/content/:resource/:id',
  wrap(async (req, res) => {
    const r = resourceFor(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw badRequest({});
    const data = finaliseRecord(r, buildRecord(r, req.body || {}));
    const result = await query(`UPDATE \`${r.table}\` SET ? WHERE id = ?`, [data, id]).catch((e) => {
      throw friendlyDbError(e);
    });
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    clearContentCache();
    await audit(req, 'update', { entity: r.table, entityId: id, details: { title: data[r.titleField] } });
    const [row] = await query(`SELECT * FROM \`${r.table}\` WHERE id = ?`, [id]);
    res.json(presentRow(r, row));
  }),
);

router.delete(
  '/content/:resource/:id',
  wrap(async (req, res) => {
    const r = resourceFor(req);
    const id = Number(req.params.id);
    const [row] = await query(`SELECT * FROM \`${r.table}\` WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await query(`DELETE FROM \`${r.table}\` WHERE id = ?`, [id]);
    clearContentCache();
    await audit(req, 'delete', { entity: r.table, entityId: id, details: { title: row[r.titleField] } });
    res.json({ ok: true });
  }),
);

router.post(
  '/content/:resource/reorder',
  wrap(async (req, res) => {
    const r = resourceFor(req);
    if (!r.fields.some((f) => f.name === 'sort_order')) throw badRequest({});
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isInteger).slice(0, 500) : [];
    for (const [i, id] of ids.entries()) await query(`UPDATE \`${r.table}\` SET sort_order = ? WHERE id = ?`, [i, id]);
    clearContentCache();
    await audit(req, 'reorder', { entity: r.table });
    res.json({ ok: true });
  }),
);

// ---- Settings & page headers -------------------------------------------------------------------

router.get(
  '/settings',
  wrap(async (req, res) => {
    const rows = await query('SELECT setting_key, setting_value FROM settings');
    res.json(Object.fromEntries(rows.filter((r) => SETTING_KEYS.has(r.setting_key)).map((r) => [r.setting_key, r.setting_value])));
  }),
);

router.put(
  '/settings',
  wrap(async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const fieldDefs = Object.fromEntries(SETTINGS.flatMap((g) => g.fields).map((f) => [f.name, f]));
    const errors = {};
    const changes = [];
    for (const [key, raw] of Object.entries(body)) {
      if (!SETTING_KEYS.has(key)) continue;
      const isPage = key.startsWith('page.');
      // Editors may change page copy; church-wide settings (contacts, channels) are admin-only.
      if (!isPage && req.admin.role !== 'admin') continue;
      const value = typeof raw === 'string' ? raw.trim() : '';
      const def = fieldDefs[key] || { type: 'text' };
      if (value.length > 5000) errors[key] = 'Too long.';
      else if (value && def.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) errors[key] = 'Enter a valid email address.';
      else if (value && def.type === 'url' && !/^https:\/\/[^\s"'<>]+$/i.test(value)) errors[key] = 'Enter a full https:// link.';
      else changes.push([key, value]);
    }
    if (Object.keys(errors).length) throw badRequest(errors);
    for (const [key, value] of changes) {
      await query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, value]);
    }
    clearContentCache();
    await audit(req, 'settings_updated', { entity: 'settings', details: { keys: changes.map(([k]) => k) } });
    res.json({ ok: true, updated: changes.length });
  }),
);

// ---- Media library -----------------------------------------------------------------------------

const MAX_UPLOAD = Number(process.env.MAX_UPLOAD_MB || 8) * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD, files: 1, fields: 5 } });

// Identify files by their content, never by the client-supplied name or MIME type. SVG is refused (it can carry scripts).
function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: '.jpg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: '.png' };
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return { mime: 'image/webp', ext: '.webp' };
  if (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a') return { mime: 'image/gif', ext: '.gif' };
  return null;
}

function dimensions(buf, mime) {
  try {
    if (mime === 'image/png') return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    if (mime === 'image/gif') return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
    if (mime === 'image/webp') {
      const chunk = buf.subarray(12, 16).toString('ascii');
      if (chunk === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
      if (chunk === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
      }
      return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    }
    if (mime === 'image/jpeg') {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return [null, null];
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
        i += 2 + len;
      }
    }
  } catch {
    /* fall through */
  }
  return [null, null];
}

const presentMedia = (m) => ({
  id: m.id,
  url: m.url,
  filename: m.filename,
  mime: m.mime,
  size: m.size_bytes,
  width: m.width,
  height: m.height,
  alt: m.alt || '',
  builtin: Boolean(m.builtin),
  createdAt: m.created_at,
});

router.get(
  '/media',
  wrap(async (req, res) => {
    const q = String(req.query.q || '').trim().slice(0, 100);
    const rows = q
      ? await query('SELECT * FROM media WHERE filename LIKE ? OR alt LIKE ? ORDER BY builtin, created_at DESC', [`%${q}%`, `%${q}%`])
      : await query('SELECT * FROM media ORDER BY builtin, created_at DESC');
    res.json(rows.map(presentMedia));
  }),
);

router.post(
  '/media',
  (req, res, next) =>
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      const message = err.code === 'LIMIT_FILE_SIZE' ? `Images must be ${MAX_UPLOAD / 1024 / 1024} MB or smaller.` : 'Upload failed.';
      res.status(400).json({ error: message });
    }),
  wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' });
    const type = sniff(req.file.buffer);
    if (!type) return res.status(400).json({ error: 'Only JPEG, PNG, WebP or GIF images can be uploaded.' });
    const [width, height] = dimensions(req.file.buffer, type.mime);
    const base = path
      .basename(req.file.originalname || 'image', path.extname(req.file.originalname || ''))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'image';
    const filename = `${base}-${crypto.randomBytes(6).toString('hex')}${type.ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), req.file.buffer, { flag: 'wx' });
    const alt = String(req.body?.alt || '').trim().slice(0, 255) || null;
    const result = await query('INSERT INTO media SET ?', [
      { url: `/uploads/${filename}`, filename, mime: type.mime, size_bytes: req.file.size, width, height, alt, uploaded_by: req.admin.id },
    ]);
    await audit(req, 'media_uploaded', { entity: 'media', entityId: result.insertId, details: { filename } });
    const [row] = await query('SELECT * FROM media WHERE id = ?', [result.insertId]);
    res.status(201).json(presentMedia(row));
  }),
);

router.patch(
  '/media/:id',
  wrap(async (req, res) => {
    const alt = String(req.body?.alt ?? '').trim().slice(0, 255);
    const result = await query('UPDATE media SET alt = ? WHERE id = ?', [alt || null, Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  }),
);

async function mediaUsage(url) {
  const uses = [];
  for (const r of Object.values(RESOURCES)) {
    for (const f of r.fields.filter((x) => x.type === 'image')) {
      const rows = await query(`SELECT id, \`${r.titleField}\` AS title FROM \`${r.table}\` WHERE \`${f.name}\` = ?`, [url]);
      uses.push(...rows.map((row) => `${r.label}: ${row.title}`));
    }
  }
  return uses;
}

router.delete(
  '/media/:id',
  wrap(async (req, res) => {
    const [m] = await query('SELECT * FROM media WHERE id = ?', [Number(req.params.id)]);
    if (!m) return res.status(404).json({ error: 'Not found' });
    if (m.builtin) return res.status(400).json({ error: 'Built-in site images can’t be deleted from the panel.' });
    const uses = await mediaUsage(m.url);
    if (uses.length) return res.status(409).json({ error: `This image is still used by ${uses.slice(0, 3).join(', ')}${uses.length > 3 ? '…' : ''}. Replace it there first.` });
    const file = path.join(UPLOAD_DIR, path.basename(m.filename));
    if (file.startsWith(UPLOAD_DIR + path.sep)) await fs.rm(file, { force: true });
    await query('DELETE FROM media WHERE id = ?', [m.id]);
    await audit(req, 'media_deleted', { entity: 'media', entityId: m.id, details: { filename: m.filename } });
    res.json({ ok: true });
  }),
);

// ---- Inbox: enquiries, visit requests, comments ------------------------------------------------

const INBOXES = {
  enquiries: { table: 'enquiries', flag: 'handled', search: ['full_name', 'email', 'message', 'subject'] },
  visits: { table: 'visit_requests', flag: 'handled', search: ['full_name', 'email'] },
  comments: { table: 'comments', flag: 'approved', search: ['name', 'email', 'body'] },
};

function inboxFor(req) {
  const box = Object.hasOwn(INBOXES, req.params.box) ? INBOXES[req.params.box] : null;
  if (!box) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  return box;
}

router.get(
  '/inbox/:box',
  wrap(async (req, res) => {
    const box = inboxFor(req);
    const where = [];
    const params = [];
    if (req.query.status === 'open') where.push(`t.\`${box.flag}\` = 0`);
    if (req.query.status === 'done') where.push(`t.\`${box.flag}\` = 1`);
    if (req.params.box === 'enquiries' && req.query.intent) {
      where.push('t.intent = ?');
      params.push(String(req.query.intent));
    }
    const q = String(req.query.q || '').trim().slice(0, 100);
    if (q) {
      where.push(`(${box.search.map((c) => `t.\`${c}\` LIKE ?`).join(' OR ')})`);
      params.push(...box.search.map(() => `%${q}%`));
    }
    const join = req.params.box === 'comments' ? ', p.title AS post_title, p.slug AS post_slug FROM comments t JOIN posts p ON p.id = t.post_id' : ` FROM \`${box.table}\` t`;
    const rows = await query(`SELECT t.*${join} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.created_at DESC LIMIT 500`, params);
    res.json(rows.map(({ ip, ...r }) => ({ ...r, ip: req.admin.role === 'admin' ? ip : undefined })));
  }),
);

router.patch(
  '/inbox/:box/:id',
  wrap(async (req, res) => {
    const box = inboxFor(req);
    const value = req.body?.[box.flag] ? 1 : 0;
    const result = await query(`UPDATE \`${box.table}\` SET \`${box.flag}\` = ? WHERE id = ?`, [value, Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    await audit(req, `${req.params.box}_${box.flag}`, { entity: box.table, entityId: req.params.id, details: { value } });
    res.json({ ok: true });
  }),
);

router.delete(
  '/inbox/:box/:id',
  wrap(async (req, res) => {
    const box = inboxFor(req);
    const result = await query(`DELETE FROM \`${box.table}\` WHERE id = ?`, [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    await audit(req, `${req.params.box}_deleted`, { entity: box.table, entityId: req.params.id });
    res.json({ ok: true });
  }),
);

// ---- Sermons -----------------------------------------------------------------------------------

router.post(
  '/sermons/refresh',
  wrap(async (req, res) => {
    const channel = process.env.YOUTUBE_CHANNEL_ID || (await getSetting('youtube_channel_id'));
    const count = await refreshSermons(channel);
    await audit(req, 'sermons_refreshed', { details: { count } });
    res.json({ ok: true, count });
  }),
);

// ---- Admin users (admins only) -----------------------------------------------------------------

const adminsOnly = requireAuth(['admin']);
const presentUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  active: Boolean(u.active),
  totpEnabled: Boolean(u.totp_enabled),
  locked: Boolean(u.is_locked),
  lastLoginAt: u.last_login_at,
  createdAt: u.created_at,
});

async function assertAnotherAdminRemains(exceptId) {
  const [{ n }] = await query("SELECT COUNT(*) AS n FROM admin_users WHERE role = 'admin' AND active = 1 AND id <> ?", [exceptId]);
  if (!n) {
    const e = new Error('There must always be at least one active admin.');
    e.status = 400;
    throw e;
  }
}

router.get(
  '/users',
  adminsOnly,
  wrap(async (req, res) => {
    const rows = await query('SELECT *, locked_until > UTC_TIMESTAMP() AS is_locked FROM admin_users ORDER BY created_at');
    res.json(rows.map(presentUser));
  }),
);

router.post(
  '/users',
  adminsOnly,
  wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || '').trim().slice(0, 120);
    const role = req.body?.role === 'admin' ? 'admin' : 'editor';
    const password = String(req.body?.password || '');
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email address.';
    if (name.length < 2) errors.name = 'Enter a name.';
    const problem = passwordProblem(password, { email, name });
    if (problem) errors.password = problem;
    if (Object.keys(errors).length) throw badRequest(errors);
    const result = await query('INSERT INTO admin_users SET ?', [{ email, name, role, password_hash: await hashPassword(password) }]).catch((e) => {
      if (e.code === 'ER_DUP_ENTRY') throw badRequest({ email: 'An admin with that email already exists.' });
      throw e;
    });
    await audit(req, 'user_created', { entity: 'admin_users', entityId: result.insertId, details: { email, role } });
    res.status(201).json({ ok: true });
  }),
);

router.patch(
  '/users/:id',
  adminsOnly,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const [user] = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    const updates = {};
    if (b.role !== undefined) updates.role = b.role === 'admin' ? 'admin' : 'editor';
    if (b.active !== undefined) updates.active = b.active ? 1 : 0;
    if (b.unlock) Object.assign(updates, { failed_attempts: 0, locked_until: null });
    if (b.resetTwoFactor) Object.assign(updates, { totp_enabled: 0, totp_secret: null });
    if (typeof b.name === 'string' && b.name.trim().length >= 2) updates.name = b.name.trim().slice(0, 120);
    if (id === req.admin.id && (updates.role === 'editor' || updates.active === 0)) {
      return res.status(400).json({ error: 'You can’t demote or disable your own account.' });
    }
    if (user.role === 'admin' && (updates.role === 'editor' || updates.active === 0)) await assertAnotherAdminRemains(id);
    if (!Object.keys(updates).length) return res.json({ ok: true });
    await query('UPDATE admin_users SET ? WHERE id = ?', [updates, id]);
    if (updates.active === 0 || updates.role || updates.totp_enabled === 0) await destroyUserSessions(id);
    await audit(req, 'user_updated', { entity: 'admin_users', entityId: id, details: { ...updates, totp_secret: undefined } });
    res.json({ ok: true });
  }),
);

router.post(
  '/users/:id/password',
  adminsOnly,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const [user] = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const password = String(req.body?.password || '');
    const problem = passwordProblem(password, user);
    if (problem) throw badRequest({ password: problem });
    await query('UPDATE admin_users SET password_hash = ?, password_changed_at = UTC_TIMESTAMP(), failed_attempts = 0, locked_until = NULL WHERE id = ?', [await hashPassword(password), id]);
    await destroyUserSessions(id);
    await audit(req, 'user_password_reset', { entity: 'admin_users', entityId: id });
    res.json({ ok: true });
  }),
);

router.delete(
  '/users/:id',
  adminsOnly,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.admin.id) return res.status(400).json({ error: 'You can’t delete your own account.' });
    const [user] = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Not found' });
    if (user.role === 'admin') await assertAnotherAdminRemains(id);
    await query('DELETE FROM admin_users WHERE id = ?', [id]);
    await audit(req, 'user_deleted', { entity: 'admin_users', entityId: id, details: { email: user.email } });
    res.json({ ok: true });
  }),
);

router.get(
  '/audit',
  adminsOnly,
  wrap(async (req, res) => {
    const rows = await query('SELECT id, user_email, action, entity, entity_id, details, ip, created_at FROM audit_log ORDER BY id DESC LIMIT 300');
    res.json(rows);
  }),
);

export default router;
