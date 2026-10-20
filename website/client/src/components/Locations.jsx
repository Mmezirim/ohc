import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export const badgeLabel = (b) => (b === 'campus' ? 'Campus fellowship' : b === 'intl' ? 'International' : 'Church');

const FILTERS = [
  ['all', 'All locations'],
  ['church', 'Churches'],
  ['campus', 'Campus fellowships'],
  ['intl', 'International'],
];

/** Locations page: filter → pick a location → details card + map. */
export function LocationDirectory({ locations = [], initialSlug }) {
  const [filter, setFilter] = useState('all');
  const [activeSlug, setActiveSlug] = useState(
    locations.some((l) => l.slug === initialSlug) ? initialSlug : locations[0]?.slug,
  );
  const detailRef = useRef(null);

  const filtered = useMemo(
    () => (filter === 'all' ? locations : locations.filter((l) => l.badge === filter)),
    [filter, locations],
  );
  const active = locations.find((l) => l.slug === activeSlug) || filtered[0];

  const chooseFilter = (f) => {
    setFilter(f);
    const next = f === 'all' ? locations : locations.filter((l) => l.badge === f);
    if (next.length && !next.some((l) => l.slug === activeSlug)) setActiveSlug(next[0].slug);
  };

  const select = (slug) => {
    setActiveSlug(slug);
    if (window.matchMedia('(max-width: 1199px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="directory">
      <div className="chips" role="group" aria-label="Filter locations">
        {FILTERS.map(([key, label]) => (
          <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => chooseFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="directory__main">
        <ul className="directory__list" aria-label="Locations">
          {filtered.map((loc) => (
            <li key={loc.slug}>
              <button
                type="button"
                className="directory__item"
                aria-current={active?.slug === loc.slug ? 'true' : undefined}
                onClick={() => select(loc.slug)}
              >
                <span className="directory__name">{loc.name}</span>
                <span className="directory__meta">
                  {loc.area} · {badgeLabel(loc.badge)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {active && (
          <div className="directory__detail" ref={detailRef} aria-live="polite">
            <article className="card card--white">
              <p className="card__label">{badgeLabel(active.badge)} · {active.area}</p>
              <h3 className="h3">{active.name}</h3>
              <dl className="facts">
                <div>
                  <dt>Where we meet</dt>
                  <dd>{active.address}</dd>
                </div>
                <div>
                  <dt>When we gather</dt>
                  <dd>
                    {active.schedule.map((s) => (
                      <span key={s} style={{ display: 'block' }}>
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>Leadership</dt>
                  <dd>{active.pastors.join(', ')}</dd>
                </div>
                {active.phone && (
                  <div>
                    <dt>Contact</dt>
                    <dd>
                      {active.phone.split('/').map((p, i) => {
                        const num = p.trim();
                        return (
                          <span key={num}>
                            {i > 0 && ' / '}
                            <a href={`tel:${num.replace(/\s/g, '')}`}>{num}</a>
                          </span>
                        );
                      })}
                    </dd>
                  </div>
                )}
                {active.note && (
                  <div>
                    <dt>Also known as</dt>
                    <dd>{active.note}</dd>
                  </div>
                )}
              </dl>
              <div className="card__footer directory__actions">
                <Link to={`/contact?intent=visit&subject=${encodeURIComponent(active.name)}`} className="btn">
                  Ask about your visit <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </article>

            <div className="directory__map">
              {active.mapEmbed && (
                <iframe
                  key={active.slug}
                  src={active.mapEmbed}
                  title={`Map of ${active.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              )}
              {active.mapDir && (
                <a className="btn btn--secondary" href={active.mapDir} target="_blank" rel="noopener noreferrer">
                  Get directions <Icon name="arrowUpRight" size={16} />
                  <span className="visually-hidden">(opens Google Maps in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
