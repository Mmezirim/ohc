import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { Logo } from './Header.jsx';
import { useContent } from '../lib/content.jsx';

const DISCOVER = [
  ['/', 'Home'],
  ['/about', 'About Oak House Church'],
  ['/locations', 'Locations'],
  ['/clusters', 'Clusters'],
  ['/sermons', 'Sermons'],
  ['/blogs', 'Blog'],
];

const TAKE_A_STEP = [
  ['/programs', 'Programs'],
  ['/giving', 'Giving'],
  ['/contact', 'Contact'],
  ['/#plan-your-visit', 'Plan Your Visit'],
  ['/contact?intent=prayer', 'Request prayer'],
  ['/contact?intent=serving', 'Prayer & serving'],
];

const SOCIALS = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
];

export default function Footer() {
  const s = useContent().content?.settings || {};
  const email = s.contact_email || 'contact@oakhousechurch.org';
  const phone = s.contact_phone || '';
  const socials = SOCIALS.filter(([key]) => s[`social_${key}`]);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" aria-label="Oak House Church — home">
              <Logo />
            </Link>
            <p>{s.footer_blurb || 'A community of faith, hope, and love, Where every soul is welcomed, valued, and empowered to live out God’s purpose.'}</p>
            {socials.length > 0 && (
              <ul className="socials">
                {socials.map(([key, label]) => (
                  <li key={key}>
                    <a href={s[`social_${key}`]} target="_blank" rel="noopener noreferrer" aria-label={`Oak House Church on ${label}`}>
                      <Icon name={key} size={20} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-labelledby="footer-discover">
            <h2 className="footer-title" id="footer-discover">
              Discover
            </h2>
            <ul className="footer-links">
              {DISCOVER.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-step">
            <h2 className="footer-title" id="footer-step">
              Take a step
            </h2>
            <ul className="footer-links">
              {TAKE_A_STEP.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="footer-title">Let’s connect</h2>
            <ul className="footer-contact">
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
                </li>
              )}
              {s.office_address && <li>{s.office_address}</li>}
              <li>
                <Link to="/locations">Service days &amp; times by location</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {new Date().getFullYear()} Oak House Church. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <Link to="/contact?intent=accessibility">Accessibility</Link>
            <a href={`mailto:${s.ict_email || 'dev@oakhousechurch.org'}`}>Website support</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
