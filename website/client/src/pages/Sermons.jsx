import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import Reveal from '../components/Reveal.jsx';
import { LiveStream, YouTubePlayer } from '../components/YouTube.jsx';
import { Eyebrow, PageIntro, Pathways, Scripture } from '../components/Sections.jsx';
import { formatDate } from '../lib/api.js';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';
import { splitSermonTitle, useSermons } from '../lib/sermons.js';

const PAGE = 9;

const typeOf = (title) => {
  const t = title.toLowerCase();
  if (t.includes('bible study') || t.includes('communion')) return 'Bible Study';
  if (t.includes('sunday')) return 'Sunday Service';
  return 'Other';
};

export default function Sermons() {
  usePageMeta('Sermons', 'Transforming lives through God’s Word — watch the latest sermons and services from Oak House Church.');
  const { content } = useContent();
  const feed = useSermons(48);
  const [params, setParams] = useSearchParams();
  const [liveOpen, setLiveOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [shown, setShown] = useState(PAGE);
  const selectedRef = useRef(null);

  const channelId = feed.channelId || content?.settings?.youtube_channel_id;
  const liveChannel = content?.settings?.youtube_live_channel_id || 'UCu27rtNX51H-aHvH4IFRbVA';
  const selected = feed.items.find((s) => s.youtubeId === params.get('v')) || feed.items[0];

  const library = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = feed.items.filter((s) => (!q || s.title.toLowerCase().includes(q)) && (type === 'all' || typeOf(s.title) === type));
    return sort === 'oldest' ? [...list].reverse() : list;
  }, [feed.items, query, type, sort]);

  const select = (id) => {
    setParams({ v: id }, { replace: true, preventScrollReset: true });
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sel = selected ? splitSermonTitle(selected.title) : null;

  return (
    <>
      <PageIntro
        page="sermons"
        eyebrow="Anywhere, anytime. · Sermons"
        title="You’re always invited."
        lead="At Oak House Church, we believe that the Word of God is the primary instrument for spiritual transformation. Every sermon is designed to reveal Christ, renew minds, strengthen faith, and equip believers to live out the message they hear."
        quote={{ text: '“But be ye doers of the word, and not hearers only, deceiving your own selves.”', reference: 'James 1:22' }}
        actions={
          <>
            <button type="button" className="btn" onClick={() => setLiveOpen(true)}>
              <span className="live-dot" aria-hidden="true" /> Watch live
            </button>
            <a href="#library" className="btn btn--secondary">
              Browse messages <Icon name="arrowRight" size={16} />
            </a>
          </>
        }
      />

      <Modal open={liveOpen} onClose={() => setLiveOpen(false)} label="Watch live">
        <LiveStream channelId={liveChannel} />
        <p className="modal__note">
          Not live right now? Watch the latest message on this page, or{' '}
          <a href={`https://www.youtube.com/channel/${liveChannel}`} target="_blank" rel="noopener noreferrer">
            visit our YouTube channel
          </a>
          .
        </p>
      </Modal>

      <section className="section section--white" id="selected-message" ref={selectedRef}>
        <div className="container">
          <Eyebrow>{params.get('v') ? 'Selected message' : 'Featured · Latest message'}</Eyebrow>
          {feed.status === 'loading' && <div className="skeleton" style={{ aspectRatio: '16 / 7' }} aria-busy="true" />}
          {feed.status === 'error' && (
            <p className="note">
              We couldn’t load the latest messages right now.{' '}
              {channelId && <a href={`https://www.youtube.com/channel/${channelId}/videos`}>Watch them on YouTube</a>}
            </p>
          )}
          {selected && (
            <div className="featured">
              <YouTubePlayer key={selected.youtubeId} id={selected.youtubeId} title={selected.title} />
              <div className="featured__info">
                <h2 className="h2">{sel.title}</h2>
                <dl className="facts">
                  {sel.detail && (
                    <div>
                      <dt>Service date</dt>
                      <dd>{sel.detail}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Published</dt>
                    <dd>{formatDate(selected.publishedAt)}</dd>
                  </div>
                </dl>
                {selected.description && <p className="featured__desc">{selected.description}</p>}
                <div className="intro__actions">
                  <a className="btn btn--secondary" href={`https://www.youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noopener noreferrer">
                    Watch on YouTube <Icon name="arrowUpRight" size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--canvas" id="library">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Explore the library</Eyebrow>
            <h2 className="h2">A message to return to.</h2>
          </Reveal>

          <div className="filters">
            <label className="field">
              <span className="field__label">Search</span>
              <input type="search" placeholder="Search titles or dates" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }} />
            </label>
            <label className="field">
              <span className="field__label">Service</span>
              <select value={type} onChange={(e) => { setType(e.target.value); setShown(PAGE); }}>
                <option value="all">All services</option>
                <option value="Sunday Service">Sunday Service</option>
                <option value="Bible Study">Bible Study &amp; Communion</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {library.length} messages found
          </p>

          {feed.status === 'ready' && library.length === 0 && (
            <div className="empty">
              <h3 className="h3">No messages match your search.</h3>
              <p>Try another word or clear the filters.</p>
              <button type="button" className="btn btn--secondary" onClick={() => { setQuery(''); setType('all'); }}>
                Clear filters <Icon name="arrowRight" size={16} />
              </button>
            </div>
          )}

          <ul className="grid grid--3 library">
            {library.slice(0, shown).map((s) => {
              const t = splitSermonTitle(s.title);
              const current = selected?.youtubeId === s.youtubeId;
              return (
                <li key={s.youtubeId}>
                  <button type="button" className="card card--white card--link sermon-card" aria-current={current ? 'true' : undefined} onClick={() => select(s.youtubeId)}>
                    <span className="sermon-card__media">
                      <img src={s.thumbnail} alt="" loading="lazy" decoding="async" />
                      {current && <span className="yt__badge">Now selected</span>}
                    </span>
                    <span className="card__label">{typeOf(s.title)}</span>
                    <span className="card__title">{t.title}</span>
                    <span className="sermon-card__meta">{[t.detail, formatDate(s.publishedAt)].filter(Boolean).join(' · ')}</span>
                    <span className="text-link sermon-card__link">
                      Message details <Icon name="arrowRight" size={16} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="library__actions">
            {shown < library.length && (
              <button type="button" className="btn btn--secondary" onClick={() => setShown((n) => n + PAGE)}>
                Load more messages
              </button>
            )}
            {channelId && (
              <a className="btn" href={`https://www.youtube.com/channel/${channelId}/?sub_confirmation=1`} target="_blank" rel="noopener noreferrer">
                <Icon name="youtube" size={18} /> Subscribe on YouTube
              </a>
            )}
          </div>
        </div>
      </section>

      <Scripture
        eyebrow="From glory to glory"
        text="“But we all, with open face beholding as in a glass the glory of the Lord, are changed into the same image from glory to glory.”"
        reference="2 Corinthians 3:18"
      />

      <Pathways
        title="Let the conversation continue."
        items={[
          { title: 'Explore life together', to: '/programs', label: 'Browse Programs' },
          { title: 'Join a gathering', to: '/locations', label: 'Plan Your Visit' },
          { title: 'Read and reflect', to: '/blogs', label: 'Read the blog' },
        ]}
      />
    </>
  );
}
