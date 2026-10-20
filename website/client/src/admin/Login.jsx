import { useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Header.jsx';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

function FirstAdminSetup({ onDone }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setErrors({ confirm: 'The passwords don’t match.' });
    setBusy(true);
    setErrors({});
    setError('');
    try {
      const res = await api.post('/auth/setup', { name: form.name, email: form.email, password: form.password });
      onDone(res.user, res.csrfToken);
    } catch (err) {
      setErrors(err.fields || {});
      setError(Object.keys(err.fields || {}).length ? '' : err.message);
    } finally {
      setBusy(false);
    }
  }

  const field = (k, label, type, ac, help) => (
    <div className="adm-field">
      <label className="adm-label" htmlFor={`setup-${k}`}>
        {label}
      </label>
      <input id={`setup-${k}`} className="adm-input" type={type} autoComplete={ac} value={form[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} />
      {help && <p className="adm-help">{help}</p>}
      {errors[k] && <p className="adm-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form className="adm-login__card" onSubmit={submit} noValidate>
      <Logo width={170} />
      <h1 className="adm-h2">Create the first admin account</h1>
      <p className="adm-note">No admin accounts exist yet. The account you create here will have full access. This page is disabled as soon as it’s done.</p>
      {error && (
        <p className="adm-alert" role="alert">
          {error}
        </p>
      )}
      {field('name', 'Your name', 'text', 'name')}
      {field('email', 'Email', 'email', 'username')}
      {field('password', 'Password', 'password', 'new-password', 'At least 8 characters.')}
      {field('confirm', 'Repeat password', 'password', 'new-password')}
      <button type="submit" className="adm-btn adm-btn--block" disabled={busy}>
        {busy ? 'Creating…' : 'Create account and sign in'}
      </button>
    </form>
  );
}

export default function Login() {
  const [needsSetup, setNeedsSetup] = useState(false);
  useEffect(() => {
    api
      .get('/auth/setup-status')
      .then((r) => setNeedsSetup(r.needsSetup))
      .catch(() => {});
  }, []);
  return needsSetup ? (
    <div className="adm-login">
      <FirstAdminSetupBridge />
    </div>
  ) : (
    <SignIn />
  );
}

function FirstAdminSetupBridge() {
  const { signIn } = useAuth();
  return <FirstAdminSetup onDone={signIn} />;
}

function SignIn() {
  const { signIn, notice } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', code: '' });
  const [step, setStep] = useState('password');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const codeRef = useRef(null);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/auth/login', step === 'code' ? form : { email: form.email, password: form.password });
      if (res.twoFactorRequired) {
        setStep('code');
        requestAnimationFrame(() => codeRef.current?.focus());
      } else {
        setForm({ email: '', password: '', code: '' });
        signIn(res.user, res.csrfToken);
      }
    } catch (err) {
      setError(err.message);
      if (step === 'code') setForm((f) => ({ ...f, code: '' }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={submit} noValidate>
        <Logo width={170} />
        <h1 className="adm-h2">{step === 'code' ? 'Two-step verification' : 'Sign in to the admin panel'}</h1>
        {notice && !error && <p className="adm-note">{notice}</p>}
        {error && (
          <p className="adm-alert" role="alert">
            {error}
          </p>
        )}

        {step === 'password' ? (
          <>
            <div className="adm-field">
              <label className="adm-label" htmlFor="login-email">
                Email
              </label>
              <input id="login-email" className="adm-input" type="email" name="email" autoComplete="username" required autoFocus value={form.email} onChange={update} />
            </div>
            <div className="adm-field">
              <label className="adm-label" htmlFor="login-password">
                Password
              </label>
              <input id="login-password" className="adm-input" type="password" name="password" autoComplete="current-password" required value={form.password} onChange={update} />
            </div>
          </>
        ) : (
          <div className="adm-field">
            <label className="adm-label" htmlFor="login-code">
              6-digit code from your authenticator app
            </label>
            <input
              id="login-code"
              ref={codeRef}
              className="adm-input adm-input--code-entry"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '') }))}
            />
          </div>
        )}

        <button type="submit" className="adm-btn adm-btn--block" disabled={busy}>
          {busy ? 'Checking…' : step === 'code' ? 'Verify and sign in' : 'Sign in'}
        </button>
        {step === 'code' && (
          <button type="button" className="adm-btn adm-btn--text" onClick={() => { setStep('password'); setForm({ email: form.email, password: '', code: '' }); }}>
            Use a different account
          </button>
        )}
        {/* <p className="adm-help">
          Forgotten your password? Ask another admin to reset it, or run <code>npm run admin:create</code> on the server.
        </p> */}
      </form>
    </div>
  );
}
