import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { DarkCta, Eyebrow, PageIntro, Pathways, Scripture } from '../components/Sections.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

const STORY = [
  'Our story at Oak House Church is a story of vision, faith, spiritual identity and becoming.',
  'Every great story begins with a seed, a thought, a burden, a vision placed in the heart of a man by God. Years ago at a quiet corner of Lagos Nigeria, a dream was born.',
  'At the time, it seemed small and insignificant, just a seed planted in faith, yet hidden within that seed was a divine purpose that would touch lives, transform destinies and spread across nations.',
  'Like the tiny acorn that eventually becomes a mighty oak tree, the dream began to grow. No one could have imagined how far it would reach. No one could have fully seen the impact it will make.',
  'What started as a small gathering of believers in February 2017, with only a handful of people, has today become a thriving spiritual family known as Oak House Church.',
];

export default function About() {
  usePageMeta('About', 'Who we are — Oak House Church exists to raise disciples who model the life, character, and teachings of Jesus Christ.');
  const { content } = useContent();
  const c = content || {};

  return (
    <>
      <PageIntro
        page="about"
        eyebrow="Who are we?"
        title="Oaks of righteousness bearing fruits."
        lead="Oak House Church exists to raise disciples who model the life, character, and teachings of Jesus Christ. We are committed to helping people encounter God, grow in His Word, develop authentic relationships, and become effective ambassadors of Christ in their generation."
        quote={{ text: '“For where two or three gather in my name, there am I with them.”', reference: 'Matthew 18:20' }}
        actions={
          <Link to="/locations" className="btn">
            Find a place to gather <Icon name="arrowRight" size={16} />
          </Link>
        }
        image="/images/IMG-20260629-WA0073.jpg"
        imageAlt="The Oak House Church congregation during a Sunday service"
      />

      <section className="section section--white">
        <div className="container">
          <div className="about-story">
            <Reveal>
              <Eyebrow>Get to know our church</Eyebrow>
              <h2 className="serif">Planting seeds of the Spirit through God’s word.</h2>
              <p className="lead about-story__lead">
                Our desire is not merely to gather people in church services but to see lives transformed and continually
                conformed to the image of Christ through discipleship, fellowship, prayer, and service.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="h3">Our story</h3>
              <div className="about-story__body">
                {STORY.map((p) => (
                  <p key={p.slice(0, 20)}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="grid grid--2 about-cards">
            <Reveal className="card">
              <p className="card__label">Our mission</p>
              <h3 className="h3">
                To create a worship experience that celebrates Christ and to fulfill the Great Commission with the Great
                Commandment.
              </h3>
            </Reveal>
            <Reveal className="card" delay={80}>
              <p className="card__label">Our beliefs</p>
              <h3 className="h3">Rooted in Scripture, saved by grace, filled with the Spirit.</h3>
              <p className="card__body">What we believe shapes how we worship, grow and love the world around us.</p>
              <div className="card__footer">
                <Link to="/contact?intent=general" className="text-link">
                  Ask about our beliefs <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--canvas" aria-labelledby="beliefs-title">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>What we believe</Eyebrow>
            <h2 className="h2" id="beliefs-title">
              The everyday shape of our faith.
            </h2>
            <p>No matter your age, background, or gift — there is a place for you to contribute and grow.</p>
          </Reveal>
          <div className="grid grid--3 beliefs">
            {(c.beliefs || []).map((b, i) => (
              <Reveal key={b.title} delay={(i % 3) * 60}>
                <h3 className="h4">{b.title}</h3>
                <p className="muted">{b.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Scripture
        eyebrow="Conformed to His image"
        text="“For whom he did foreknow, he also did predestinate to be conformed to the image of his Son.”"
        reference="Romans 8:29"
      />

      <section className="section section--white" aria-labelledby="leaders-title">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Preachers · People &amp; leadership</Eyebrow>
            <h2 className="h2" id="leaders-title">
              Meet the people who serve.
            </h2>
            <p>The pastors who lead our family of churches across Lagos, Ogun State and beyond.</p>
          </Reveal>
          <ul className="leaders">
            {(c.leaders || []).map((l, i) => (
              <Reveal as="li" className="leader" key={l.name} delay={(i % 3) * 60}>
                <img src={l.photo} alt={`Portrait of ${l.name}`} loading="lazy" decoding="async" width="500" height="600" />
                <h3 className="h4">{l.name}</h3>
                <p className="leader__role">{l.role}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Pathways
        title="From getting to know us, to finding your place."
        items={[
          { title: 'Life in a smaller circle', to: '/clusters', label: 'Explore Clusters' },
          { title: 'Come and gather', to: '/locations', label: 'Explore Locations' },
          { title: 'Start a conversation', to: '/contact', label: 'Contact us' },
        ]}
      />

      <DarkCta
        title="Come as you are."
        text="Whether you are new to faith or returning after a long time away — there is a place for you here. We’d love to welcome you."
        to="/contact?intent=visit"
        label="Start a conversation"
      />
    </>
  );
}
