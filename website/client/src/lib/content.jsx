import { createContext, useContext, useEffect, useState } from 'react';
import { getJson } from './api.js';

const ContentContext = createContext({ content: null, error: null });

/** Loads all page content (/api/content) once and shares it with every page. */
export function ContentProvider({ children }) {
  const [state, setState] = useState({ content: null, error: null });

  useEffect(() => {
    let alive = true;
    getJson('/api/content')
      .then((content) => alive && setState({ content, error: null }))
      .catch((error) => alive && setState({ content: null, error }));
    return () => {
      alive = false;
    };
  }, []);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

/**
 * Page header copy, editable in Admin → Page headers. Any field left blank there falls back to the
 * built-in default passed by the page.
 */
export function usePageCopy(page, defaults = {}) {
  const settings = useContext(ContentContext).content?.settings || {};
  const get = (key, fallback) => {
    const v = page ? settings[`page.${page}.${key}`] : '';
    return typeof v === 'string' && v.trim() ? v.trim() : fallback;
  };
  const quoteText = get('quote_text', defaults.quote?.text);
  return {
    eyebrow: get('eyebrow', defaults.eyebrow),
    title: get('title', defaults.title),
    lead: get('lead', defaults.lead),
    quote: quoteText ? { text: quoteText, reference: get('quote_ref', defaults.quote?.reference || '') } : null,
  };
}
