import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useScrolled } from '../lib/hooks.js';

export const NAV = [
  { to: '/about', label: 'About' },
  { to: '/locations', label: 'Locations' },
  { to: '/clusters', label: 'Clusters' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/programs', label: 'Programs' },
  { to: '/giving', label: 'Giving' },
  { to: '/contact', label: 'Contact' },
];

export function Logo({ width = 182 }) {
  return (
    <picture>
      <source srcSet="/images/logo-oakhouse-sm.webp 1x, /images/logo-oakhouse.webp 2x" type="image/webp" />
      <img src="/images/logo-oakhouse-sm.png" alt="Oak House Church — Modelling the message" width={width} height={Math.round(width * 0.44)} />
    </picture>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  // Menu: focus the first item when opened, Escape closes and returns focus, trap Tab inside.
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('no-scroll');
    const panel = panelRef.current;
    panel?.querySelector('a, button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && panel) {
        const items = [...panel.querySelectorAll('a, button')];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label="Oak House Church — home">
          <Logo />
        </Link>

        <nav className="main-nav" aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
          <Link to="/locations" className="btn">
            Plan Your Visit <Icon name="arrowRight" size={16} />
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
        >
          Menu <Icon name="menu" size={22} />
        </button>
      </div>

      <div id="mobile-nav" className="mobile-nav" hidden={!open} onMouseDown={(e) => e.target === e.currentTarget && close()}>
        <div className="mobile-nav__panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Explore Oak House">
          <div className="mobile-nav__head">
            <Link to="/" aria-label="Oak House Church — home">
              <Logo width={140} />
            </Link>
            <button type="button" className="mobile-nav__close" onClick={close} aria-label="Close menu">
              <Icon name="close" size={22} />
            </button>
          </div>
          <p className="mobile-nav__title">Explore Oak House</p>
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
          <Link to="/locations" className="btn btn--block">
            Plan Your Visit <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
