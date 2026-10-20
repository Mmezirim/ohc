import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { initDb } from './db.js';
import publicRoutes from './routes/public.js';
import adminRoutes, { UPLOAD_DIR } from './routes/admin.js';
import { allowedOrigins } from './admin/session.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');
const PORT = Number(process.env.PORT || 5000);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'https://i.ytimg.com', 'https://*.ytimg.com', 'https://*.googleusercontent.com'],
        'frame-src': ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://www.google.com', 'https://maps.google.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'object-src': ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // YouTube embeds refuse to play without a referrer (player error 153).
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
app.use(compression());

// When the site is hosted elsewhere (e.g. Hostinger), list its origin(s) in CORS_ORIGIN. Credentials are
// allowed so the admin panel's session cookie is sent; requireAuth() still checks the origin and CSRF token.
const origins = allowedOrigins();
if (origins.length) app.use('/api', cors({ origin: origins, credentials: true, maxAge: 600 }));

// Admin API first (larger body limit for blog posts); everything else gets the small public limit.
app.use('/api/admin', express.json({ limit: '300kb' }), adminRoutes);
app.use(express.json({ limit: '50kb' }));
app.use('/api', publicRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Uploaded media: images only (validated on upload), never executed or sniffed as anything else.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'deny',
    fallthrough: false,
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      // Let the separately hosted site show these images.
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'none'; sandbox");
    },
  }),
);

// The admin panel is never indexed.
app.use('/admin', (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Serve the built React app (npm run build) with long-lived caching for hashed assets.
if (fs.existsSync(clientDist)) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, file) {
        if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        else if (file.includes(`${path.sep}images${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=604800');
      },
    }),
  );
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? 'Something went wrong. Please try again.' : err.message,
    ...(err.fields ? { fields: err.fields } : {}),
  });
});

await initDb();
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
