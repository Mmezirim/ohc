import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { DarkCta, Eyebrow } from '../components/Sections.jsx';
import NotFound from './NotFound.jsx';
import { ProgramCard } from './Programs.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

export default function ProgramDetail() {
  const { slug } = useParams();
  const { content } = useContent();
  const programs = content?.events || [];
  const p = programs.find((x) => x.slug === slug);
  usePageMeta(p?.title || 'Programs', p?.description);

  if (content && !p) return <NotFound />;
  if (!p) return <div className="page-loading" aria-busy="true" />;

  const enquire = `/contact?intent=program&subject=${encodeURIComponent(p.title)}`;
  const others = programs.filter((x) => x.slug !== p.slug);

  return (
    <>
      <section className="intro">
        <div className="container">
          <Link to="/programs" className="text-link back-link">
            <Icon name="arrowLeft" size={16} /> Back to all Programs
          </Link>
          <Eyebrow>Programs / {p.category}</Eyebrow>
          <h1 className="h1">{p.title}</h1>
          <p className="lead intro__lead">{p.description}</p>
        </div>
      </section>

      <section className="section section--white">
        <div className="container program">
          <div>
            <Reveal as="figure" className="program__media">
              <img src={p.image} alt={`${p.title} flyer`} decoding="async" />
            </Reveal>
            <Reveal className="program__about">
              <Eyebrow>About this program</Eyebrow>
              <h2 className="serif">{p.title}</h2>
              <p className="lead">{p.details || p.description}</p>
            </Reveal>
          </div>

          <aside className="card card--white program__aside">
            <p className="card__label">The details</p>
            <dl className="facts">
              <div>
                <dt>When</dt>
                <dd>{p.schedule || 'Dates are announced in church — ask us for the next one.'}</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>{p.venue || 'Venue announced in church — ask us for details.'}</dd>
              </div>
              {p.audience && (
                <div>
                  <dt>Who it’s for</dt>
                  <dd>{p.audience}</dd>
                </div>
              )}
              <div>
                <dt>Category</dt>
                <dd>{p.category}</dd>
              </div>
            </dl>
            <div className="card__footer">
              <Link to={enquire} className="btn btn--block">
                Enquire about this program <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section--canvas">
          <div className="container">
            <Reveal className="section-head section-head--row">
              <div>
                <Eyebrow>More to explore</Eyebrow>
                <h2 className="h2">Other ways to gather.</h2>
              </div>
              <Link to="/programs" className="text-link">
                All programs <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
            <ul className="grid grid--3">
              {others.map((o) => (
                <li key={o.slug}>
                  <ProgramCard program={o} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <DarkCta
        title="Have a question about taking part?"
        text="Share what you’d like to know about this program and we’ll get back to you."
        to={enquire}
        label="Ask about this program"
      />
    </>
  );
}
