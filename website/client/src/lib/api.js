// Where the API lives. Empty = same origin (local dev, or Express serving the build); set VITE_API_URL
// at build time when the site and the API are hosted separately (e.g. Hostinger + Render).
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/** Uploaded media is stored on the API server; site images (/images/...) ship with the front end. */
export const mediaUrl = (src) => (src && src.startsWith('/uploads/') ? API_BASE + src : src);

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(url, options) {
  let res;
  try {
    res = await fetch(API_BASE + url, options);
  } catch {
    throw new ApiError('Network error — please check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields);
  return data;
}

export const getJson = (url) => request(url);

export const postJson = (url, body) =>
  request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export function formatDate(value, opts = { month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!value) return '';
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', opts);
}
