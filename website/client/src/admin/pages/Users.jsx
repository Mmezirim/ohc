import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHeader, Spinner, formatWhen, useConfirm, useLoad, useToast } from '../ui.jsx';

// Readable random passphrase-style temporary password.
function generatePassword() {
  const words = ['oak', 'river', 'maple', 'cedar', 'light', 'stone', 'grace', 'harbor', 'summit', 'meadow', 'ember', 'willow', 'canvas', 'beacon', 'orchard'];
  const rand = new Uint32Array(5);
  crypto.getRandomValues(rand);
  return `${words[rand[0] % words.length]}-${words[rand[1] % words.length]}-${words[rand[2] % words.length]}-${(rand[3] % 900) + 100}${'!#%&*'[rand[4] % 5]}`;
}

function NewUser({ onCreated }) {
  const notify = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: 'editor', password: generatePassword() });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.post('/users', form);
      notify(`Account created. Share the temporary password with ${form.name} securely — they should change it after signing in.`);
      onCreated();
      setForm({ name: '', email: '', role: 'editor', password: generatePassword() });
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-card adm-form-grid" onSubmit={submit} noValidate>
      <h2 className="adm-h3 adm-field--wide">Add an admin user</h2>
      {[
        ['name', 'Name', 'text', 'name'],
        ['email', 'Email', 'email', 'off'],
      ].map(([k, label, type, ac]) => (
        <div className="adm-field" key={k}>
          <label className="adm-label" htmlFor={`nu-${k}`}>
            {label}
          </label>
          <input id={`nu-${k}`} className="adm-input" type={type} autoComplete={ac} value={form[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} />
          {errors[k] && <p className="adm-error">{errors[k]}</p>}
        </div>
      ))}
      <div className="adm-field">
        <label className="adm-label" htmlFor="nu-role">
          Role
        </label>
        <select id="nu-role" className="adm-input" value={form.role} onChange={set('role')}>
          <option value="editor">Editor — content, media and inbox</option>
          <option value="admin">Admin — everything, including users and settings</option>
        </select>
      </div>
      <div className="adm-field">
        <label className="adm-label" htmlFor="nu-password">
          Temporary password
        </label>
        <div className="adm-inline">
          <input id="nu-password" className="adm-input adm-input--code" autoComplete="new-password" value={form.password} onChange={set('password')} aria-invalid={Boolean(errors.password)} />
          <button type="button" className="adm-icon-btn" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))} aria-label="Generate another password">
            <Icon name="refresh" size={18} />
          </button>
        </div>
        {errors.password && <p className="adm-error">{errors.password}</p>}
      </div>
      <div className="adm-actions adm-field--wide">
        <button type="submit" className="adm-btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const notify = useToast();
  const confirm = useConfirm();
  const list = useLoad(() => api.get('/users'));

  const patch = async (u, body, message) => {
    try {
      await api.patch(`/users/${u.id}`, body);
      notify(message);
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const resetPassword = async (u) => {
    const password = generatePassword();
    if (!(await confirm({ title: `Reset ${u.name}’s password?`, message: `Their new temporary password will be: ${password}\n\nCopy it now — they’ll be signed out everywhere.`, confirmLabel: 'Reset password' }))) return;
    try {
      await api.post(`/users/${u.id}/password`, { password });
      await navigator.clipboard?.writeText(password).catch(() => {});
      notify('Password reset and copied to your clipboard.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (u) => {
    if (!(await confirm({ title: `Delete ${u.name}?`, message: 'They lose access immediately.', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.del(`/users/${u.id}`);
      notify('User deleted.');
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Admin users" description="Who can sign in to this panel. Editors manage content, media and the inbox; admins can also manage settings and users." />
      {list.status === 'loading' && !list.data && <Spinner />}
      {list.data && (
        <ul className="adm-list">
          {list.data.map((u) => (
            <li key={u.id} className="adm-list__item adm-list__item--wrap">
              <div className="adm-list__main">
                <strong>
                  {u.name} {u.id === me.id && <span className="adm-tag">You</span>}
                </strong>
                <span className="adm-muted">
                  {u.email} · last sign-in {formatWhen(u.lastLoginAt)}
                </span>
              </div>
              <span className="adm-tag">{u.role}</span>
              {u.totpEnabled && <span className="adm-tag adm-tag--ok">2FA on</span>}
              {!u.active && <span className="adm-tag adm-tag--muted">Disabled</span>}
              {u.locked && <span className="adm-tag adm-tag--warn">Locked</span>}
              {u.id !== me.id && (
                <div className="adm-actions">
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => patch(u, { role: u.role === 'admin' ? 'editor' : 'admin' }, 'Role updated.')}>
                    Make {u.role === 'admin' ? 'editor' : 'admin'}
                  </button>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => patch(u, { active: !u.active }, u.active ? 'Account disabled.' : 'Account enabled.')}>
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                  {u.locked && (
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => patch(u, { unlock: true }, 'Account unlocked.')}>
                      Unlock
                    </button>
                  )}
                  {u.totpEnabled && (
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => patch(u, { resetTwoFactor: true }, 'Two-factor reset. They can set it up again.')}>
                      Reset 2FA
                    </button>
                  )}
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => resetPassword(u)}>
                    Reset password
                  </button>
                  <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(u)} aria-label={`Delete ${u.name}`}>
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <NewUser onCreated={list.reload} />
    </>
  );
}
