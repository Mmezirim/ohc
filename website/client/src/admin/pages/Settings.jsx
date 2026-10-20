import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useSchema } from '../AdminApp.jsx';
import { FieldInput, PageHeader, Spinner, useToast } from '../ui.jsx';

/** Shared key/value editor used by Site settings and Page headers. */
export function SettingsForm({ groups, title, description }) {
  const notify = useToast();
  const [values, setValues] = useState(null);
  const [saved, setSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((s) => {
        setValues(s);
        setSaved(s);
      })
      .catch((e) => notify(e.message, 'error'));
  }, [notify]);

  const keys = useMemo(() => groups.flatMap((g) => g.fields.map((f) => f.name)), [groups]);
  const dirty = values && keys.some((k) => (values[k] ?? '') !== (saved[k] ?? ''));

  if (!values) return <Spinner />;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const changed = Object.fromEntries(keys.filter((k) => (values[k] ?? '') !== (saved[k] ?? '')).map((k) => [k, values[k] ?? '']));
    try {
      await api.put('/settings', changed);
      setSaved(values);
      notify('Saved — the website is updated.');
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title={title} description={description}>
        <button type="submit" className="adm-btn" disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </PageHeader>
      {groups.map((g) => (
        <section className="adm-card adm-form-grid" key={g.group} aria-labelledby={`grp-${g.group}`}>
          <h2 className="adm-h3 adm-field--wide" id={`grp-${g.group}`}>
            {g.group}
          </h2>
          {g.note && <p className="adm-help adm-field--wide">{g.note}</p>}
          {g.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name] ?? ''} error={errors[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
          ))}
        </section>
      ))}
      <div className="adm-actions adm-actions--end">
        {dirty && <span className="adm-muted">Unsaved changes</span>}
        <button type="submit" className="adm-btn" disabled={busy || !dirty}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const schema = useSchema();
  if (!schema) return <Spinner />;
  return <SettingsForm groups={schema.settings} title="Site settings" description="Contact details, social links and other church-wide information shown across the website." />;
}
