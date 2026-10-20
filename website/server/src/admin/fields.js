import { badRequest } from '../lib/validate.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asText(v, max = 255) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string' && typeof v !== 'number') throw new Error('Invalid value.');
  const s = String(v).replace(/\u0000/g, '').trim();
  if (s.length > max) throw new Error(`Use at most ${max} characters.`);
  return s;
}

/** Converts one submitted value to its database form, or throws with a field-level message. */
export function coerce(field, raw) {
  const t = field.type;
  if (t === 'bool') return raw === true || raw === 1 || raw === '1' || raw === 'true' ? 1 : 0;
  if (t === 'int') {
    if (raw === '' || raw === null || raw === undefined) return 0;
    const n = Number(raw);
    if (!Number.isInteger(n) || Math.abs(n) > 1e6) throw new Error('Enter a whole number.');
    return n;
  }
  if (t === 'list') {
    const arr = Array.isArray(raw) ? raw : String(raw ?? '').split('\n');
    const clean = arr.map((x) => asText(x, 255)).filter(Boolean);
    if (clean.length > 50) throw new Error('Too many lines.');
    return JSON.stringify(clean);
  }

  const s = asText(raw, field.max ?? (t === 'textarea' || t === 'markdown' ? 5000 : 255));
  if (!s) return field.required ? (() => { throw new Error('This field is required.'); })() : t === 'select' ? '' : null;

  switch (t) {
    case 'slug':
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) throw new Error('Use lowercase letters, numbers and single hyphens only.');
      return s;
    case 'select':
      if (!field.options.some(([v]) => v === s)) throw new Error('Choose one of the options.');
      return s;
    case 'email':
      if (!EMAIL_RE.test(s)) throw new Error('Enter a valid email address.');
      return s.toLowerCase();
    case 'url':
      if (!/^https:\/\/[^\s"'<>]+$/i.test(s)) throw new Error('Enter a full https:// link.');
      return s;
    case 'image':
      // Only images from the media library / site: a site-relative path, no protocol tricks.
      if (!/^\/(images|uploads)\/[A-Za-z0-9._-]+$/.test(s)) throw new Error('Choose an image from the media library.');
      return s;
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new Error('Enter a valid date.');
      return s;
    case 'datetime': {
      const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?$/);
      if (!m || Number.isNaN(Date.parse(`${m[1]}T${m[2]}`))) throw new Error('Enter a valid date and time.');
      return `${m[1]} ${m[2]}${m[3] || ':00'}`;
    }
    default:
      return s;
  }
}

/** Validates a whole record against a resource's fields. Unknown keys are ignored (column whitelist). */
export function buildRecord(resource, body, { partial = false } = {}) {
  const data = {};
  const errors = {};
  for (const field of resource.fields) {
    if (partial && !(field.name in body)) continue;
    const value = field.name in body ? body[field.name] : field.default;
    try {
      data[field.name] = coerce(field, value);
    } catch (err) {
      errors[field.name] = err.message;
    }
  }
  if (Object.keys(errors).length) throw badRequest(errors);
  return data;
}

/** Shape a DB row for the panel (JSON lists back to arrays, dates to input-friendly strings). */
export function presentRow(resource, row) {
  const out = { id: row.id };
  for (const f of resource.fields) {
    let v = row[f.name];
    if (f.type === 'list') {
      try {
        v = Array.isArray(v) ? v : JSON.parse(v || '[]');
      } catch {
        v = [];
      }
    } else if (f.type === 'bool') v = Boolean(v);
    else if (f.type === 'datetime' && v) v = String(v).slice(0, 16).replace(' ', 'T');
    else if (f.type === 'date' && v) v = String(v).slice(0, 10);
    out[f.name] = v ?? (f.type === 'int' ? 0 : '');
  }
  return out;
}
