// Admin API client. Session lives in an httpOnly cookie (never readable by JS); the CSRF token is
// kept in memory only and sent as a header on every state-changing request.
import { API_BASE } from '../lib/api.js';

let csrfToken = null;
export const setCsrfToken = (t) => {
  csrfToken = t;
};

export class AdminError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(method, url, body) {
  const headers = { Accept: 'application/json' };
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;
  let res;
  try {
    res = await fetch(`${API_BASE}/api/admin${url}`, {
      method,
      headers,
      credentials: 'include',
      cache: 'no-store',
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new AdminError('Network error — check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.startsWith('/auth/login')) {
    window.dispatchEvent(new CustomEvent('admin:signed-out', { detail: data.error }));
  }
  if (!res.ok) throw new AdminError(data.error || `Request failed (${res.status})`, res.status, data.fields);
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body = {}) => request('POST', url, body),
  put: (url, body = {}) => request('PUT', url, body),
  patch: (url, body = {}) => request('PATCH', url, body),
  del: (url) => request('DELETE', url),
  upload: (url, formData) => request('POST', url, formData),
};
