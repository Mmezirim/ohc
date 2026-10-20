import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { Logo } from '../components/Header.jsx';
import { AuthProvider, useAuth } from './auth.jsx';
import { api } from './api.js';
import { ConfirmProvider, Spinner, ToastProvider } from './ui.jsx';
import Login from './Login.jsx';
import './admin.css';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const ContentList = lazy(() => import('./pages/ContentList.jsx'));
const ContentEditor = lazy(() => import('./pages/ContentEditor.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const PageHeaders = lazy(() => import('./pages/PageHeaders.jsx'));
const Media = lazy(() => import('./pages/Media.jsx'));
const Inbox = lazy(() => import('./pages/Inbox.jsx'));
const Users = lazy(() => import('./pages/Users.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Audit = lazy(() => import('./pages/Audit.jsx'));

export function useSchema() {
  const [schema, setSchema] = useState(window.__ohcAdminSchema || null);
  useEffect(() => {
    if (schema) return;
    api
      .get('/schema')
      .then((s) => {
        window.__ohcAdminSchema = s;
        setSchema(s);
      })
      .catch(() => {});
  }, [schema]);
  return schema;
}

function Sidebar({ open, onClose }) {
  const { user, signOut } = useAuth();
  const schema = useSchema();
  const isAdmin = user.role === 'admin';
  const link = (to, icon, label, end) => (
    <li>
      <NavLink to={to} end={end} onClick={onClose}>
        <Icon name={icon} size={18} /> {label}
      </NavLink>
    </li>
  );

  return (
    <aside className={`adm-sidebar ${open ? 'is-open' : ''}`} aria-label="Admin navigation">
      <div className="adm-sidebar__brand">
        <Link to="/admin" onClick={onClose}>
          <Logo width={132} />
        </Link>
        <span className="adm-badge">Admin</span>
      </div>
      <nav>
        <ul>
          {link('/admin', 'grid', 'Dashboard', true)}
          {link('/admin/inbox/enquiries', 'inbox', 'Inbox')}
        </ul>
        <p className="adm-nav-title">Website content</p>
        <ul>
          {(schema?.resources || []).map((r) => (
            <li key={r.key}>
              <NavLink to={`/admin/content/${r.key}`} onClick={onClose}>
                <Icon name="list" size={18} /> {r.label}
              </NavLink>
            </li>
          ))}
          {link('/admin/pages', 'file', 'Page headers')}
          {link('/admin/media', 'image', 'Media library')}
        </ul>
        <p className="adm-nav-title">Administration</p>
        <ul>
          {isAdmin && link('/admin/settings', 'settings', 'Site settings')}
          {isAdmin && link('/admin/users', 'users', 'Admin users')}
          {isAdmin && link('/admin/audit', 'shield', 'Activity log')}
          {link('/admin/account', 'user', 'My account')}
        </ul>
      </nav>
      <div className="adm-sidebar__foot">
        <p>
          <strong>{user.name}</strong>
          <span>
            {user.email} · {user.role}
          </span>
        </p>
        <div className="adm-actions">
          <a className="adm-btn adm-btn--ghost adm-btn--sm" href="/" target="_blank" rel="noopener noreferrer">
            View site <Icon name="external" size={14} />
          </a>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={signOut}>
            <Icon name="logout" size={14} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function Shell() {
  const { status, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);

  if (status === 'loading') return <Spinner label="Checking your session…" />;
  if (status !== 'signed-in') return <Login />;

  const adminOnly = (el) => (user.role === 'admin' ? el : <Navigate to="/admin" replace />);

  return (
    <div className="adm-shell">
      <a className="skip-link" href="#adm-main">
        Skip to content
      </a>
      <header className="adm-topbar">
        <button type="button" className="adm-icon-btn" aria-expanded={menuOpen} aria-controls="adm-sidebar" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle navigation">
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
        <span>Oak House Admin</span>
      </header>
      <div id="adm-sidebar">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
      <main className="adm-main" id="adm-main">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="inbox/:box" element={<Inbox />} />
            <Route path="content/:resource" element={<ContentList />} />
            <Route path="content/:resource/:id" element={<ContentEditor />} />
            <Route path="pages" element={<PageHeaders />} />
            <Route path="media" element={<Media />} />
            <Route path="settings" element={adminOnly(<Settings />)} />
            <Route path="users" element={adminOnly(<Users />)} />
            <Route path="audit" element={adminOnly(<Audit />)} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Admin | Oak House Church';
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => meta.remove();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Shell />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
