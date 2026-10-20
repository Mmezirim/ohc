import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { LocationDirectory } from '../components/Locations.jsx';
import { DarkCta, Eyebrow, PageIntro, Scripture } from '../components/Sections.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

const HELPFUL = [
  {
    title: 'Before you travel',
    text: 'Check the service days and times for your chosen location above. If anything is unclear, ask us before you set off — we’re happy to help.',
  },
  {
    title: 'Coming with children?',
    text: 'We have got you covered. Ages 1–15 stay in the Oak Children’s church, and young adults also have their own church. Provision for proper care will be available for your ward. You can also come with necessary things for your ward.',
  },
  {
    title: 'Access and parking',
    text: 'Free, uninterrupted access to park, with 24/7 security personnel to watch and preserve your car. Kindly follow the instruction of the security personnel.',
  },
];

export default function Locations() {
  usePageMeta('Locations', 'Find an Oak House Church location near you — churches across Lagos and Ogun State, campus fellowships and Accra, Ghana.');
  const { content } = useContent();
  const [params] = useSearchParams();
  const locations = content?.locations || [];

  return (
    <>
      <PageIntro
        page="locations"
        eyebrow="Plan your visit / Locations"
        title="Find a Family of Believers."
        lead="Our church locations are more than meeting venues; they are communities where people are loved, discipled, equipped, and empowered to follow Jesus wholeheartedly. We invite you to worship with us and become part of a family committed to growing together in Christ."
        quote={{
          text: '“And they continued steadfastly in the apostles’ doctrine and fellowship, and in breaking of bread, and in prayers.”',
          reference: 'Acts 2:42',
        }}
        actions={
          <>
            <a href="#find-your-way" className="btn">
              Find a location <Icon name="arrowRight" size={16} />
            </a>
            <Link to="/contact?intent=visit" className="btn btn--secondary">
              Ask about your visit <Icon name="arrowRight" size={16} />
            </Link>
          </>
        }
      />

      <section className="section section--white" id="find-your-way">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Find your way</Eyebrow>
            <h2 className="h2">A place to gather.</h2>
            <p>
              {locations.length > 0 ? `${locations.length} locations` : 'Our locations'} — churches across Lagos and Ogun State,
              campus fellowships, and a church in Accra, Ghana.
            </p>
          </Reveal>
          {locations.length > 0 && <LocationDirectory key={params.get('l') || 'all'} locations={locations} initialSlug={params.get('l')} />}
        </div>
      </section>

      <section className="section section--canvas">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>The little things that help</Eyebrow>
            <h2 className="serif">Make room for a warm beginning.</h2>
          </Reveal>
          <div className="grid grid--3">
            {HELPFUL.map((h, i) => (
              <Reveal className="card" key={h.title} delay={i * 60}>
                <h3 className="card__title">{h.title}</h3>
                <p className="card__body">{h.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container qa">
          <Reveal className="qa__intro">
            <Eyebrow>Your questions matter</Eyebrow>
            <h2 className="h2">A little clarity before you come.</h2>
            <p>Can’t find what you need? Ask us anything about your visit and we’ll help you plan it.</p>
            <Link to="/contact?intent=visit" className="btn">
              Ask a visit question <Icon name="arrowRight" size={16} />
            </Link>
          </Reveal>
          <Reveal className="qa__list" delay={80}>
            <div>
              <h3>What time should I arrive?</h3>
              <p>Each location lists its service days and times above. Arriving a little early gives you time to settle in and meet people.</p>
            </div>
            <div>
              <h3>What should I wear?</h3>
              <p>Come as you are. There is no bias in the presence of God. Come one, come all.</p>
            </div>
            <div>
              <h3>Is there provision for children?</h3>
              <p>Yes. Ages 1–15 stay in the Oak Children’s church, with proper care provided for your ward.</p>
            </div>
            <div>
              <h3>Can I discuss accessibility needs?</h3>
              <p>
                Yes — use the <Link to="/contact?intent=accessibility">accessibility support enquiry</Link> to describe what
                would help, and we’ll get back to you.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Scripture eyebrow="An invitation" text="“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”" reference="Matthew 11:28" />

      <DarkCta
        title="We’d love to welcome you."
        text="Whether you are visiting for the first time or searching for a spiritual home, you are warmly welcome."
        to="/contact?intent=visit"
        label="Ask about your visit"
      />
    </>
  );
}
