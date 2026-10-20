import { isDbAvailable, query } from '../db.js';
import * as seed from '../data/seed.js';

const TTL_MS = 60 * 1000;
let cache = null;
let cachedAt = 0;

const parseJson = (v, fallback = []) => {
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

function shapeLocation(l) {
  return {
    slug: l.slug,
    name: l.name,
    cardName: l.card_name || l.name,
    badge: l.badge,
    area: l.area,
    address: l.address,
    cardAddress: l.card_address || l.address,
    primaryService: l.primary_service,
    pastors: parseJson(l.pastors),
    schedule: parseJson(l.schedule),
    phone: l.phone || '',
    note: l.note || '',
    mapEmbed: l.map_embed || '',
    mapDir: l.map_dir || '',
  };
}

function shapeSettings(entries) {
  const s = Object.fromEntries(entries);
  s.home_gallery = parseJson(s.home_gallery);
  return s;
}

function shapeProgram(e) {
  return {
    slug: e.slug,
    title: e.title,
    category: e.category || 'Connection',
    schedule: e.schedule || '',
    venue: e.venue || '',
    audience: e.audience || '',
    description: e.description,
    details: e.details || '',
    image: e.image,
  };
}

function shapeCluster(c) {
  return {
    name: c.name,
    chapter: c.chapter || '',
    area: c.area,
    leader: c.leader || '',
    phone: c.phone || '',
    email: c.email || '',
    day: c.meeting_day || '',
    time: c.meeting_time || '',
    contact: c.contact || '',
    notes: c.notes || '',
  };
}

function shapeGiving(a) {
  return {
    group: a.account_group,
    purpose: a.purpose,
    icon: a.icon,
    bank: a.bank,
    accountName: a.account_name,
    accountNumber: a.account_number,
    codeLabel: a.code_label,
    codeDisplay: a.code_display,
    codeCopy: a.code_copy,
    bankAddress: a.bank_address || '',
  };
}

function fromSeed() {
  return {
    settings: shapeSettings(Object.entries(seed.settings)),
    serviceTimes: seed.serviceTimes.map(({ title, time_label }) => ({ title, time: time_label })),
    locations: seed.locations.map(shapeLocation),
    events: seed.events.map(shapeProgram),
    clusters: (seed.clusters || []).map(shapeCluster),
    ministries: seed.ministries,
    beliefs: seed.beliefs,
    leaders: seed.leaders,
    timeline: seed.timeline.map(({ year_label, title, body }) => ({ year: year_label, title, body })),
    giving: seed.givingAccounts.map(shapeGiving),
    featuredMessages: seed.featuredMessages.map((m) => ({
      eyebrow: 'live recording',
      title: m.title,
      preacher: m.preacher,
      date: m.message_date,
      youtubeId: null,
    })),
  };
}

async function fromDb() {
  const order = 'ORDER BY sort_order, id';
  const [settings, times, locs, events, ministries, beliefs, leaders, timeline, giving, featured, clusters] = await Promise.all([
    query('SELECT setting_key, setting_value FROM settings'),
    query(`SELECT title, time_label FROM service_times ${order}`),
    query(`SELECT * FROM locations ${order}`),
    query(`SELECT * FROM events WHERE active = 1 ${order}`),
    query(`SELECT title, description, icon FROM ministries ${order}`),
    query(`SELECT title, description, icon FROM beliefs ${order}`),
    query(`SELECT name, role, photo FROM leaders ${order}`),
    query(`SELECT year_label, title, body FROM timeline ${order}`),
    query(`SELECT * FROM giving_accounts ${order}`),
    query(`SELECT eyebrow, title, preacher, message_date, youtube_id FROM featured_messages ${order}`),
    query('SELECT * FROM clusters WHERE active = 1 ORDER BY chapter, sort_order, name'),
  ]);
  return {
    settings: shapeSettings(settings.map((r) => [r.setting_key, r.setting_value])),
    serviceTimes: times.map((t) => ({ title: t.title, time: t.time_label })),
    locations: locs.map(shapeLocation),
    events: events.map(shapeProgram),
    clusters: clusters.map(shapeCluster),
    ministries,
    beliefs,
    leaders,
    timeline: timeline.map((t) => ({ year: t.year_label, title: t.title, body: t.body })),
    giving: giving.map(shapeGiving),
    featuredMessages: featured.map((m) => ({
      eyebrow: m.eyebrow,
      title: m.title,
      preacher: m.preacher,
      date: m.message_date,
      youtubeId: m.youtube_id,
    })),
  };
}

/** All static page content in one payload (small, cached for a minute). */
export async function getSiteContent() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  cache = isDbAvailable() ? await fromDb() : fromSeed();
  cachedAt = Date.now();
  return cache;
}

/** Drop the cached payload so admin edits appear on the site immediately. */
export function clearContentCache() {
  cache = null;
  cachedAt = 0;
}

export async function getSetting(key) {
  const content = await getSiteContent();
  return content.settings[key];
}
