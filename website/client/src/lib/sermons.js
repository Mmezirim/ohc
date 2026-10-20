import { useEffect, useState } from 'react';
import { getJson } from './api.js';

/** Latest sermons from the church YouTube channel (cached server-side). */
export function useSermons(limit = 24) {
  const [state, setState] = useState({ status: 'loading', items: [], channelId: null });
  useEffect(() => {
    let alive = true;
    getJson(`/api/sermons?limit=${limit}`)
      .then((d) => alive && setState({ status: 'ready', items: d.items || [], channelId: d.channelId }))
      .catch(() => alive && setState({ status: 'error', items: [], channelId: null }));
    return () => {
      alive = false;
    };
  }, [limit]);
  return state;
}

/** "SUNDAY SERVICE | OCTOBER 4TH, 2026" → "Sunday Service" + the rest, for calmer display. */
export function splitSermonTitle(title = '') {
  const [first, ...rest] = title.split('|').map((t) => t.trim()).filter(Boolean);
  const tidy = (t) => t.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\b(\d+)(St|Nd|Rd|Th)\b/g, (m, d, s) => d + s.toLowerCase());
  return { title: tidy(first || title), detail: rest.map(tidy).join(' · ') };
}
