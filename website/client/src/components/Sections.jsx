import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import { usePageCopy } from '../lib/content.jsx';

export function Eyebrow({ children, line = false, as: Tag = 'p', className = '' }) {
  return <Tag className={`eyebrow ${line ? 'eyebrow--line' : ''} ${className}`}>{children}</Tag>;
}

/** Page intro on the white → lavender gradient, with an optional photo on the right. */
export function PageIntro({ page, actions, image, imageAlt = '', caption, ...defaults }) {
  const { eyebrow, title, lead, quote } = usePageCopy(page, defaults);
  return (
    <section className={`intro ${image ? 'intro--split' : ''}`}>
      <div className="container">
        <div className="intro__text">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="h1">{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {quote && (
            <blockquote className="intro__quote">
              {quote.text}
              <cite>{quote.reference}</cite>
            </blockquote>
          )}
          {actions && <div className="intro__actions">{actions}</div>}
        </div>
        {image && (
          <figure className="media">
            <img src={image} alt={imageAlt} fetchpriority="high" decoding="async" />
            {caption && <figcaption className="caption">{caption}</figcaption>}
          </figure>
        )}
      </div>
    </section>
  );
}

/** Full-width scripture on deep plum (DM Serif Display). */
export function Scripture({ eyebrow, text, reference, note }) {
  return (
    <section className="scripture">
      <Reveal as="figure" className="container scripture__inner">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <blockquote>{text}</blockquote>
        <cite>{reference}</cite>
        {note && <p>{note}</p>}
      </Reveal>
    </section>
  );
}

/** Deep plum closing call to action. */
export function DarkCta({ title, text, to, label }) {
  return (
    <section className="cta-dark">
      <Reveal className="container">
        <h2 className="serif">{title}</h2>
        <p>{text}</p>
        <Link to={to} className="btn btn--light">
          {label} <Icon name="arrowRight" size={16} />
        </Link>
      </Reveal>
    </section>
  );
}

/** Three simple onward-journey cards. */
export function Pathways({ title, items }) {
  return (
    <section className="section section--canvas">
      <div className="container">
        <Reveal as="h2" className="serif section-head">
          {title}
        </Reveal>
        <div className="grid grid--3">
          {items.map((item, i) => (
            <Reveal className="card pathway" key={item.title} delay={i * 60}>
              <h3 className="card__title">{item.title}</h3>
              {item.text && <p className="card__body">{item.text}</p>}
              <Link to={item.to} className="text-link">
                {item.label} <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
