import { XMLParser } from 'fast-xml-parser';
import { isDbAvailable, query } from '../db.js';

// YouTube's public channel feed returns the latest 15 uploads — no API key needed.
const FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const memory = { at: 0, items: [] };

function toMysqlDate(iso) {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
}

async function fetchFeed(channelId) {
  const res = await fetch(FEED_URL + encodeURIComponent(channelId), {
    headers: { 'User-Agent': 'OakHouseChurchWebsite/1.0' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`YouTube feed responded ${res.status}`);
  const xml = parser.parse(await res.text());
  const entries = [].concat(xml?.feed?.entry || []);
  return entries.map((e) => {
    const group = e['media:group'] || {};
    return {
      youtubeId: e['yt:videoId'],
      title: String(e.title ?? ''),
      description: String(group['media:description'] ?? ''),
      thumbnail: group['media:thumbnail']?.url || `https://i.ytimg.com/vi/${e['yt:videoId']}/hqdefault.jpg`,
      publishedAt: e.published,
    };
  });
}

async function readCache(limit) {
  const rows = await query(
    'SELECT youtube_id, title, description, thumbnail, published_at FROM sermons ORDER BY published_at DESC LIMIT ?',
    [limit],
  );
  return rows;
}

async function writeCache(items) {
  for (const s of items) {
    await query(
      `INSERT INTO sermons (youtube_id, title, description, thumbnail, published_at, fetched_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description),
         thumbnail = VALUES(thumbnail), fetched_at = NOW()`,
      [s.youtubeId, s.title, s.description, s.thumbnail, toMysqlDate(s.publishedAt)],
    );
  }
}

const shapeRow = (r) => ({
  youtubeId: r.youtube_id,
  title: r.title,
  description: r.description,
  thumbnail: r.thumbnail,
  publishedAt: `${r.published_at.replace(' ', 'T')}Z`, // stored as UTC
});

/**
 * Latest sermons. Refreshes from YouTube when the cache is older than YOUTUBE_CACHE_MINUTES;
 * if YouTube is unreachable the last cached list is served instead.
 */
export async function getSermons(channelId, limit = 24) {
  const maxAge = Number(process.env.YOUTUBE_CACHE_MINUTES || 30) * 60 * 1000;

  if (isDbAvailable()) {
    const rows = await readCache(limit);
    const [{ age }] = await query('SELECT TIMESTAMPDIFF(SECOND, MAX(fetched_at), NOW()) AS age FROM sermons');
    if (rows.length && age !== null && age * 1000 < maxAge) return rows.map(shapeRow);
    try {
      await writeCache(await fetchFeed(channelId));
      return (await readCache(limit)).map(shapeRow);
    } catch (err) {
      console.warn('[sermons] refresh failed:', err.message);
      return rows.map(shapeRow);
    }
  }

  if (memory.items.length && Date.now() - memory.at < maxAge) return memory.items.slice(0, limit);
  try {
    memory.items = await fetchFeed(channelId);
    memory.at = Date.now();
  } catch (err) {
    console.warn('[sermons] refresh failed:', err.message);
  }
  return memory.items.slice(0, limit);
}

/** Fetches the feed now and updates the cache (used by the admin "Refresh sermons" button). */
export async function refreshSermons(channelId) {
  const items = await fetchFeed(channelId);
  if (isDbAvailable()) await writeCache(items);
  memory.items = items;
  memory.at = Date.now();
  return items.length;
}
