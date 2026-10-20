import { query } from '../db.js';
import { randomToken, safeEqual, sha256 } from './security.js';

const IDLE_MINUTES = Number(process.env.ADMIN_IDLE_MINUTES || 60);
const ABSOLUTE_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 12);
const isProd = process.env.NODE_ENV === 'production';
// "__Host-" cookies must be Secure, path=/ and host-only — the browser enforces it. Only possible over HTTPS.
export const COOKIE = isProd ? '__Host-ohc_admin' : 'ohc_admin';

function cookieHeader(value, maxAgeSeconds) {
  return [
    `${COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    isProd ? 'Secure' : null,
    `Max-Age=${maxAgeSeconds}`,
  ]
    .filter(Boolean)
    .join('; ');
}

function readCookie(req) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
  }
  return null;
}

const toSql = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

export async function createSession(req, res, userId) {
  const token = randomToken(32);
  const csrf = randomToken(32);
  const expires = new Date(Date.now() + ABSOLUTE_HOURS * 3600 * 1000);
  await query('INSERT INTO admin_sessions SET ?', [
    {
      id: sha256(token),
      user_id: userId,
      csrf_token: csrf,
      ip: req.ip,
      user_agent: String(req.get('user-agent') || '').slice(0, 255),
      created_at: toSql(new Date()),
      last_seen: toSql(new Date()),
      expires_at: toSql(expires),
    },
  ]);
  res.setHeader('Set-Cookie', cookieHeader(token, ABSOLUTE_HOURS * 3600));
  return csrf;
}

export async function destroySession(req, res) {
  const token = readCookie(req);
  if (token) await query('DELETE FROM admin_sessions WHERE id = ?', [sha256(token)]);
  res.setHeader('Set-Cookie', cookieHeader('', 0));
}

export const destroyUserSessions = (userId, exceptSessionId = null) =>
  exceptSessionId
    ? query('DELETE FROM admin_sessions WHERE user_id = ? AND id <> ?', [userId, exceptSessionId])
    : query('DELETE FROM admin_sessions WHERE user_id = ?', [userId]);

export const purgeExpiredSessions = () =>
  query(`DELETE FROM admin_sessions WHERE expires_at < UTC_TIMESTAMP() OR last_seen < UTC_TIMESTAMP() - INTERVAL ${IDLE_MINUTES} MINUTE`);

/** Loads the session + user from the cookie. Returns null when missing, expired, idle or the user is disabled. */
export async function loadSession(req) {
  const token = readCookie(req);
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const [row] = await query(
    `SELECT s.id AS session_id, s.csrf_token, s.last_seen, s.expires_at,
            u.id, u.email, u.name, u.role, u.active, u.totp_enabled, u.password_changed_at,
            TIMESTAMPDIFF(SECOND, s.last_seen, UTC_TIMESTAMP()) AS idle_seconds,
            s.expires_at < UTC_TIMESTAMP() AS expired
       FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
      WHERE s.id = ?`,
    [id],
  );
  if (!row) return null;
  if (row.expired || row.idle_seconds > IDLE_MINUTES * 60 || !row.active) {
    await query('DELETE FROM admin_sessions WHERE id = ?', [id]);
    return null;
  }
  // Sliding idle timeout; write at most once a minute.
  if (row.idle_seconds > 60) await query('UPDATE admin_sessions SET last_seen = UTC_TIMESTAMP() WHERE id = ?', [id]);
  return row;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function sameOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return true; // same-origin fetches from older browsers omit it; SameSite=Strict still applies
  try {
    const o = new URL(origin);
    const host = req.get('x-forwarded-host') || req.get('host');
    return o.host === host;
  } catch {
    return false;
  }
}

/** Requires a valid session; for state-changing requests also a matching CSRF token and same origin. */
export function requireAuth(roles = null) {
  return async (req, res, next) => {
    try {
      const session = await loadSession(req);
      if (!session) return res.status(401).json({ error: 'Your session has ended. Please sign in again.' });
      if (!SAFE_METHODS.has(req.method)) {
        if (!sameOrigin(req)) return res.status(403).json({ error: 'Request blocked (cross-origin).' });
        if (!safeEqual(req.get('x-csrf-token'), session.csrf_token)) {
          return res.status(403).json({ error: 'Security check failed. Please reload the page and try again.' });
        }
      }
      if (roles && !roles.includes(session.role)) return res.status(403).json({ error: 'You don’t have permission to do that.' });
      req.admin = session;
      next();
    } catch (err) {
      next(err);
    }
  };
}
