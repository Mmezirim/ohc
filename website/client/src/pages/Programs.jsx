import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { DarkCta, Eyebrow, PageIntro } from '../components/Sections.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

export function ProgramCard({ program: p }) {
  return (
    <Link to={`/programs/${p.slug}`} className="card card--media card--link program-card">
      <img src={p.image} alt={`${p.title} flyer`} loading="lazy" decoding="async" />
      <div className="card__content">
        <p className="card__label">{p.category}</p>
        <h3 className="card__title">{p.title}</h3>
        <p className="card__body program-card__desc">{p.description}</p>
        <span className="program-card__foot">
          <span>{p.schedule || 'Dates announced in church'}</span>
          <span className="text-link">
            View program <Icon name="arrowRight" size={16} />
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function Programs() {
  usePageMeta('Programs', 'Programs at Oak House Church — gatherings for worship, prayer and connection.');
  const { content } = useContent();
  const programs = content?.events || [];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [featured] = programs;

  const categories = useMemo(() => [...new Set(programs.map((p) => p.category))], [programs]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter(
      (p) => (!q || `${p.title} ${p.description}`.toLowerCase().includes(q)) && (category === 'all' || p.category === category),
    );
  }, [programs, query, category]);

  return (
    <>
      <PageIntro
        page="programs"
        eyebrow="Programs / Gather & grow"
        title="Good things begin together."
        lead="Join us for these special gatherings designed to build community and deepen your faith — moments of worship, prayer and genuine connection."
      />

      {featured && (
        <section className="section section--white">
          <div className="container split">
            <Reveal as="figure" className="media">
              <img src={featured.image} alt={`${featured.title} flyer`} loading="lazy" decoding="async" />
            </Reveal>
            <Reveal delay={80}>
              <Eyebrow>Featured program · {featured.category}</Eyebrow>
              <h2 className="h2">{featured.title}</h2>
              <p className="lead split__lead">{featured.description}</p>
              <Link to={`/programs/${featured.slug}`} className="btn">
                View program <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section section--canvas">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Explore what’s ahead</Eyebrow>
            <h2 className="h2">Find a moment to be part of.</h2>
          </Reveal>

          <div className="filters" style={{ '--cols': 2 }}>
            <label className="field">
              <span className="field__label">Search</span>
              <input type="search" placeholder="Search programs" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Categories</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="visually-hidden" aria-live="polite">
            {results.length} programs found
          </p>

          {results.length ? (
            <ul className="grid grid--3">
              {results.map((p) => (
                <li key={p.slug}>
                  <ProgramCard program={p} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <h3 className="h3">No programs match your search.</h3>
              <p>Try another word or category.</p>
              <button type="button" className="btn btn--secondary" onClick={() => { setQuery(''); setCategory('all'); }}>
                Clear filters <Icon name="arrowRight" size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section section--white">
        <div className="container split">
          <Reveal>
            <Eyebrow>Dates &amp; times</Eyebrow>
            <h2 className="serif">A calendar with room for what’s next.</h2>
            <p className="lead split__lead">
              Program dates are announced in church and on our channels. Ask us about any program and we’ll share the details.
            </p>
            <Link to="/contact?intent=program" className="text-link">
              Ask a program question <Icon name="arrowRight" size={16} />
            </Link>
          </Reveal>
          <Reveal className="calendar-card" delay={80}>
            <Icon name="calendar" size={28} />
            <h3 className="h4">Weekly at HQ</h3>
            <ul>
              {(content?.serviceTimes || []).map((s) => (
                <li key={s.title}>
                  <span>{s.title}</span>
                  <strong>{s.time}</strong>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <DarkCta
        title="Have a question about taking part?"
        text="Share the program name and what you’d like to know, and we’ll get back to you."
        to="/contact?intent=program"
        label="Ask about a program"
      />
    </>
  );
}
