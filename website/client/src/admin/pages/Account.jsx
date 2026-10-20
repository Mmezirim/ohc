import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHeader, formatWhen, useLoad, useToast } from '../ui.jsx';

function ChangePassword() {
  const notify = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setErrors({ confirm: 'The passwords don’t match.' });
    setBusy(true);
    setErrors({});
    try {
      await api.post('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      notify('Password changed. Your other sessions were signed out.');
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const field = (k, label, ac, help) => (
    <div className="adm-field">
      <label className="adm-label" htmlFor={`pw-${k}`}>
        {label}
      </label>
      <input id={`pw-${k}`} className="adm-input" type="password" autoComplete={ac} value={form[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} />
      {help && <p className="adm-help">{help}</p>}
      {errors[k] && <p className="adm-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form className="adm-card adm-stack" onSubmit={submit} noValidate>
      <h2 className="adm-h3">Change password</h2>
      {field('currentPassword', 'Current password', 'current-password')}
      {field('newPassword', 'New password', 'new-password', 'At least 8 characters. A short phrase of unrelated words works well.')}
      {field('confirm', 'Repeat new password', 'new-password')}
      <div>
        <button type="submit" className="adm-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  );
}

function TwoFactor() {
  const { user, refresh } = useAuth();
  const notify = useToast();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const start = async () => {
    try {
      setSetup(await api.post('/auth/2fa/setup'));
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const enable = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/2fa/enable', { code });
      setSetup(null);
      setCode('');
      notify('Two-factor authentication is on.');
      refresh();
    } catch (err) {
      setError(err.fields?.code || err.message);
    }
  };

  const disable = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/2fa/disable', { password, code });
      setPassword('');
      setCode('');
      notify('Two-factor authentication is off.');
      refresh();
    } catch (err) {
      setError(err.fields?.password || err.fields?.code || err.message);
    }
  };

  return (
    <section className="adm-card adm-stack">
      <h2 className="adm-h3">Two-factor authentication</h2>
      <p className="adm-muted">
        Adds a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…) to every sign-in.
        {user.totpEnabled ? ' It is currently on.' : ' Strongly recommended for every admin.'}
      </p>

      {!user.totpEnabled && !setup && (
        <div>
          <button type="button" className="adm-btn" onClick={start}>
            Set up two-factor
          </button>
        </div>
      )}

      {setup && (
        <form className="adm-stack" onSubmit={enable}>
          <div className="adm-2fa">
            <img src={setup.qr} alt="QR code for your authenticator app" width="180" height="180" />
            <div>
              <p>1. Scan this code with your authenticator app.</p>
              <p className="adm-muted">
                Can’t scan? Enter this key manually: <code className="adm-code">{setup.secret.match(/.{1,4}/g).join(' ')}</code>
              </p>
              <p>2. Enter the 6-digit code it shows.</p>
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="tfa-code">
              Code
            </label>
            <input id="tfa-code" className="adm-input adm-input--short" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            {error && <p className="adm-error">{error}</p>}
          </div>
          <div className="adm-actions">
            <button type="submit" className="adm-btn">
              Turn on two-factor
            </button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setSetup(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {user.totpEnabled && (
        <form className="adm-form-grid" onSubmit={disable}>
          <div className="adm-field">
            <label className="adm-label" htmlFor="tfa-pw">
              Your password
            </label>
            <input id="tfa-pw" className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="tfa-code2">
              Current code
            </label>
            <input id="tfa-code2" className="adm-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          </div>
          {error && <p className="adm-error adm-field--wide">{error}</p>}
          <div className="adm-field--wide">
            <button type="submit" className="adm-btn adm-btn--danger-ghost">
              Turn off two-factor
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Sessions() {
  const notify = useToast();
  const list = useLoad(() => api.get('/auth/sessions'));
  const revoke = async () => {
    try {
      await api.post('/auth/sessions/revoke-others');
      notify('Signed out of all other devices.');
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
  };
  return (
    <section className="adm-card adm-stack">
      <h2 className="adm-h3">Where you’re signed in</h2>
      <ul className="adm-rows">
        {(list.data || []).map((s, i) => (
          <li key={i}>
            <span>
              <strong>{s.current ? 'This device' : 'Another device'}</strong>
              <span className="adm-muted"> · {s.userAgent?.replace(/\s*\(.*?\)\s*/, ' ').slice(0, 60)}</span>
            </span>
            <span className="adm-muted">
              {s.ip} · active {formatWhen(s.lastSeen)}
            </span>
          </li>
        ))}
      </ul>
      {(list.data || []).length > 1 && (
        <div>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={revoke}>
            Sign out all other devices
          </button>
        </div>
      )}
    </section>
  );
}

export default function Account() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="My account" description={`${user.name} · ${user.email} · ${user.role}`} />
      <div className="adm-two-col">
        <ChangePassword />
        <TwoFactor />
      </div>
      <Sessions />
    </>
  );
}
