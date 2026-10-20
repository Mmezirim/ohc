import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { YouTubePlayer } from '../components/YouTube.jsx';
import { Eyebrow, Scripture } from '../components/Sections.jsx';
import { useContent, usePageCopy } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';
import { formatDate } from '../lib/api.js';
import { splitSermonTitle, useSermons } from '../lib/sermons.js';

const VALUES = ['Jesus at the centre', 'Everyone welcome', 'Growing together', 'Love in action'];

const NEXT_STEPS = [
  {
    icon: 'chat',
    title: 'Connect',
    text: 'Have a question or need prayer? You don’t have to take the next step alone.',
    to: '/contact?intent=prayer',
    label: 'Start a conversation',
  },
  {
    icon: 'hand',
    title: 'Serve',
    text: 'Bring your gifts, your time, and your heart. Make a difference alongside others.',
    to: '/contact?intent=serving',
    label: 'Find a way to serve',
  },
  {
    icon: 'giftHeart',
    title: 'Give',
    text: 'Giving is an expression of worship, stewardship, and partnership in God’s work.',
    to: '/giving',
    label: 'Explore giving',
  },
];

function LatestMessages() {
  const { status, items, channelId } = useSermons(4);
  const [featured, ...more] = items;

  return (
    <section className="section section--white">
      <div className="container">
        <Reveal className="section-head section-head--row">
          <div>
            <Eyebrow>Worship &amp; the Word</Eyebrow>
            <h2 className="h2">Be inspired by the Word.</h2>
          </div>
          <Link to="/sermons" className="text-link">
            Explore all messages <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>

        {status === 'loading' && <div className="skeleton" style={{ aspectRatio: '16 / 7' }} aria-busy="true" />}
        {status === 'error' && (
          <p className="note">
            The latest messages couldn’t load right now.{' '}
            {channelId && <a href={`https://www.youtube.com/channel/${channelId}`}>Watch on YouTube</a>}
          </p>
        )}

        {featured && (
          <div className="messages">
            <Reveal className="messages__featured">
              <YouTubePlayer id={featured.youtubeId} title={featured.title} badge="Latest message" />
              <h3 className="h3">{splitSermonTitle(featured.title).title}</h3>
              <p className="muted">
                {[splitSermonTitle(featured.title).detail, formatDate(featured.publishedAt)].filter(Boolean).join(' · ')}
              </p>
            </Reveal>
            <Reveal delay={100} className="messages__more">
              <p className="messages__more-title">More room to grow</p>
              <ul>
                {more.map((m) => {
                  const t = splitSermonTitle(m.title);
                  return (
                    <li key={m.youtubeId}>
                      <Link to={`/sermons?v=${m.youtubeId}#selected-message`} className="message-row">
                        <span className="message-row__play" aria-hidden="true">
                          <Icon name="play" size={16} />
                        </span>
                        <span className="message-row__text">
                          <span className="card__label">Message</span>
                          <span className="message-row__title">{t.title}</span>
                          <span className="message-row__meta">{[t.detail, formatDate(m.publishedAt)].filter(Boolean).join(' · ')}</span>
                        </span>
                        <Icon name="arrowUpRight" size={18} className="message-row__arrow" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(null, 'Welcome to Oak House Church — a community of believers passionately committed to modeling the message of Jesus Christ.');
  const { content } = useContent();
  const c = content || {};
  const hq = c.locations?.[0];
  const hero = usePageCopy('home', {
    eyebrow: 'You’re welcome here',
    title: 'Welcome to Oak House Church',
    lead: 'Grow in faith, find community, and encounter God.',
  });

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__text">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 className="h1">{hero.title}</h1>
            <p className="lead">{hero.lead}</p>
            <div className="intro__actions">
              <a href="#plan-your-visit" className="btn">
                Plan your visit <Icon name="arrowUpRight" size={16} />
              </a>
              <Link to="/sermons" className="btn btn--secondary">
                Watch a message <Icon name="arrowUpRight" size={16} />
              </Link>
            </div>
            <p className="home-hero__note">
              <Icon name="heart" size={18} /> Come as you are. You’re welcome here.
            </p>
          </div>
          <figure className="home-hero__media">
            <img src="/images/IMG-20260629-WA0076.jpg" alt="The Oak House Church family worshipping together" fetchpriority="high" />
            <figcaption className="home-hero__card">
              <strong>Oak House Church</strong>
              <span>…Modelling the message</span>
            </figcaption>
          </figure>
        </div>
        <ul className="container home-hero__values" aria-label="What we value">
          {VALUES.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </section>

      <section className="section section--white" id="plan-your-visit">
        <div className="container visit">
          <Reveal className="visit__text">
            <Eyebrow>Plan your visit</Eyebrow>
            <h2 className="h2">Your first Sunday starts here.</h2>
            <p className="lead">
              Whether you are visiting for the first time or searching for a spiritual home, you are warmly welcome. We’ll help
              you feel at home from the moment you arrive.
            </p>
            <Link to="/locations" className="btn">
              Explore locations <Icon name="arrowUpRight" size={16} />
            </Link>
          </Reveal>
          <Reveal delay={100} className="card visit__card">
            <div className="visit__row">
              <span className="visit__icon">
                <Icon name="clock" size={20} />
              </span>
              <div>
                <h3 className="visit__label">HQ service times</h3>
                <ul className="visit__times">
                  {(c.serviceTimes || []).map((s) => (
                    <li key={s.title}>
                      <span>{s.title}</span>
                      <strong>{s.time}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {hq && (
              <div className="visit__row">
                <span className="visit__icon">
                  <Icon name="pin" size={20} />
                </span>
                <div>
                  <h3 className="visit__label">Find your way</h3>
                  <p className="visit__value">{hq.address}</p>
                  <Link to="/locations" className="text-link visit__link">
                    See all {c.locations.length} locations <Icon name="arrowRight" size={16} />
                  </Link>
                </div>
              </div>
            )}
            <p className="visit__foot">
              Wondering what to wear or bringing children? Not a problem. There is no bias in the presence of God. Come one, come
              all.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section--lavender">
        <div className="container heart">
          <Reveal as="figure" className="heart__media">
            <img src="/images/IMG-20260629-WA0073.jpg" alt="The congregation gathered for a service at Oak House Church" loading="lazy" decoding="async" />
            <figcaption className="caption">Faith grows in the everyday moments we share.</figcaption>
          </Reveal>
          <Reveal delay={100} className="heart__text">
            <Eyebrow>The heart of Oak House</Eyebrow>
            <h2 className="serif">Modelling the message. Conforming people to His image.</h2>
            <p className="lead">
              Welcome to Oak House Church, a community of believers passionately committed to modeling the message of Jesus
              Christ and conforming people to His image. We believe that Christianity is more than a gathering; it is a journey
              of transformation where lives are shaped by God’s Word, empowered by His Spirit, and expressed through practical
              obedience to Christ.
            </p>
            <p className="heart__statement">Every encounter with Christ is an invitation to become more like Him.</p>
            <Link to="/about" className="text-link">
              Get to know our church <Icon name="arrowRight" size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <LatestMessages />

      <section className="section section--lavender">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Life together</Eyebrow>
            <h2 className="h2">Find your place. Grow your faith.</h2>
            <p>No matter your age, background, or gift — there is a place for you to contribute and grow.</p>
          </Reveal>
          <div className="grid grid--4">
            {(c.ministries || []).map((m, i) => (
              <Reveal className="card card--white ministry" key={m.title} delay={i * 60}>
                <span className="ministry__icon">
                  <Icon name={m.icon} size={24} />
                </span>
                <h3 className="card__title">{m.title}</h3>
                <p className="card__body">{m.description}</p>
                <div className="card__footer">
                  <Link to="/contact?intent=serving" className="text-link">
                    Join this team <Icon name="arrowUpRight" size={16} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <Reveal className="section-head section-head--row">
            <div>
              <Eyebrow>Make space in your week</Eyebrow>
              <h2 className="h2">Good things happen together.</h2>
            </div>
            <Link to="/programs" className="text-link">
              View all programs <Icon name="arrowRight" size={16} />
            </Link>
          </Reveal>
          <div className="grid grid--3">
            {(c.events || []).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link to={`/programs/${p.slug}`} className="card card--media card--link program-card">
                  <img src={p.image} alt={`${p.title} flyer`} loading="lazy" decoding="async" />
                  <div className="card__content">
                    <p className="card__label">{p.category}</p>
                    <h3 className="card__title">{p.title}</h3>
                    <p className="card__body program-card__desc">{p.description}</p>
                    <span className="program-card__foot">
                      <span>{p.schedule || 'Dates announced in church'}</span>
                      <Icon name="arrowUpRight" size={18} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Scripture
        eyebrow="Our heart for you"
        text="“My little children, of whom I travail in birth again until Christ be formed in you.”"
        reference="Galatians 4:19"
        note="God did not bring you this far to leave you. Your best days are not behind you — they are ahead."
      />

      <section className="section section--white">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Faith in motion</Eyebrow>
            <h2 className="h2">There’s a next step for everyone.</h2>
            <p>Start a conversation. Share your gifts. Put love into action.</p>
          </Reveal>
          <div className="grid grid--3 steps">
            {NEXT_STEPS.map((s, i) => (
              <Reveal className="step" key={s.title} delay={i * 60}>
                <h3 className="step__title">
                  <Icon name={s.icon} size={26} /> {s.title}
                </h3>
                <p>{s.text}</p>
                <Link to={s.to} className="text-link">
                  {s.label} <Icon name="arrowUpRight" size={16} />
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="cta-card home-cta">
            <div className="cta-card__text">
              <Eyebrow>Your story belongs here</Eyebrow>
              <h2 className="serif">We’d love to meet you.</h2>
              <p>
                Transformation is a journey. We would be honored to walk that journey with you. Come as you are, encounter
                Christ, and allow Him to shape you into all He has called you to be.
              </p>
              <Link to="/locations" className="btn">
                Plan your first visit <Icon name="arrowUpRight" size={16} />
              </Link>
            </div>
            <div className="cta-card__media">
              <img src="/images/IMG-20260629-WA0030.jpg" alt="Members of the Oak House Church family" loading="lazy" decoding="async" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
