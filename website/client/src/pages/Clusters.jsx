import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { DarkCta, Eyebrow, PageIntro } from '../components/Sections.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

const JOURNEY = [
  {
    title: 'Explore',
    text: 'Consider your area, your availability and what you hope to find in a smaller group of believers.',
  },
  {
    title: 'Share your interest',
    text: 'Choose Register interest to send us a cluster enquiry. Include the cluster name if one has caught your eye.',
  },
  {
    title: 'Confirm the details',
    text: 'The church will confirm meeting arrangements and a point of contact so you know exactly where to go.',
  },
];

export default function Clusters() {
  usePageMeta('Clusters', 'Clusters at Oak House Church — a smaller circle for friendship, honest conversation and growing in faith together.');
  const { content } = useContent();
  const clusters = content?.clusters || [];
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('all');
  const [chapter, setChapter] = useState('all');

  const areas = useMemo(() => [...new Set(clusters.map((c) => c.area).filter(Boolean))].sort(), [clusters]);
  const chapters = useMemo(() => [...new Set(clusters.map((c) => c.chapter).filter(Boolean))].sort(), [clusters]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clusters.filter(
      (c) =>
        (!q || `${c.name} ${c.area} ${c.leader}`.toLowerCase().includes(q)) &&
        (area === 'all' || c.area === area) &&
        (chapter === 'all' || c.chapter === chapter),
    );
  }, [clusters, query, area, chapter]);

  const clear = () => {
    setQuery('');
    setArea('all');
    setChapter('all');
  };

  return (
    <>
      <PageIntro
        page="clusters"
        eyebrow="Clusters / Life together"
        title="A smaller circle. Meaningful connection."
        lead="We were never meant to do life alone. Clusters make space for friendship, honest conversation and growing in faith — a smaller circle within the wider Oak House family."
        actions={
          <Link to="/contact?intent=clusters" className="btn">
            Help me find a cluster <Icon name="arrowRight" size={16} />
          </Link>
        }
        image="/images/IMG-20260629-WA0044.jpg"
        imageAlt="Members of Oak House Church gathered together"
      />

      <section className="section section--white" aria-labelledby="clusters-title">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Find your people</Eyebrow>
            <h2 className="h2" id="clusters-title">
              Explore a place to connect.
            </h2>
            <p>
              {clusters.length
                ? `${clusters.length} clusters meet across Lagos. Find one near you and reach out to the cluster leader, or register your interest and we’ll connect you.`
                : 'Search by name or area to find a cluster near you.'}
            </p>
          </Reveal>

          <div className="filters">
            <label className="field">
              <span className="field__label">Search</span>
              <input type="search" placeholder="Search by area, cluster or leader" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Areas</span>
              <select value={area} onChange={(e) => setArea(e.target.value)}>
                <option value="all">All areas</option>
                {areas.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Church chapter</span>
              <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
                <option value="all">All chapters</option>
                {chapters.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {results.length} clusters found
          </p>

          {results.length > 0 ? (
            <ul className="grid grid--3">
              {results.map((c) => (
                <li className="card" key={c.name}>
                  <p className="card__label">
                    {c.chapter ? `${c.chapter} chapter · ` : ''}
                    {c.area}
                  </p>
                  <h3 className="card__title">{c.name}</h3>
                  <dl className="facts">
                    {c.leader && (
                      <div>
                        <dt>Cluster leader</dt>
                        <dd>{c.leader}</dd>
                      </div>
                    )}
                    {c.phone && (
                      <div>
                        <dt>Phone</dt>
                        <dd>
                          <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a>
                        </dd>
                      </div>
                    )}
                    {c.email && (
                      <div>
                        <dt>Email</dt>
                        <dd className="facts__wrap">
                          <a href={`mailto:${c.email}`}>{c.email}</a>
                        </dd>
                      </div>
                    )}
                    {(c.day || c.time) && (
                      <div>
                        <dt>Meetings</dt>
                        <dd>{[c.day, c.time].filter(Boolean).join(' · ')}</dd>
                      </div>
                    )}
                  </dl>
                  {c.notes && <p className="card__body">{c.notes}</p>}
                  <div className="card__footer">
                    <Link to={`/contact?intent=clusters&subject=${encodeURIComponent(c.name)}`} className="text-link">
                      Register interest <Icon name="arrowRight" size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <h3 className="h3">{clusters.length ? 'No clusters match your search.' : 'Our cluster directory is coming soon.'}</h3>
              <p>
                {clusters.length
                  ? 'Try another area or clear the filters.'
                  : 'Tell us your area and the days that work for you, and we’ll connect you with a cluster near you.'}
              </p>
              <div className="empty__actions">
                {clusters.length > 0 && (
                  <button type="button" className="btn btn--secondary" onClick={clear}>
                    Clear filters <Icon name="arrowRight" size={16} />
                  </button>
                )}
                <Link to="/contact?intent=clusters" className={clusters.length ? 'text-link' : 'btn'}>
                  Help me find a cluster <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section--canvas">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>A simple next step</Eyebrow>
            <h2 className="serif">Begin with a conversation.</h2>
          </Reveal>
          <ol className="grid grid--3 journey">
            {JOURNEY.map((j, i) => (
              <Reveal as="li" key={j.title} delay={i * 60}>
                <span className="journey__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="h3">{j.title}</h3>
                <p className="muted">{j.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <DarkCta
        title="Not sure where to start?"
        text="You don’t need to choose a group before asking a question. Share your area, availability or access needs in a cluster enquiry."
        to="/contact?intent=clusters"
        label="Ask about Clusters"
      />
    </>
  );
}
