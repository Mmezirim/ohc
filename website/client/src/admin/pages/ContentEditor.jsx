import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { useSchema } from '../AdminApp.jsx';
import { FieldInput, PageHeader, Spinner, slugify, useConfirm, useToast } from '../ui.jsx';

function emptyRecord(def) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return Object.fromEntries(
    def.fields.map((f) => [
      f.name,
      f.default ?? (f.type === 'bool' ? false : f.type === 'list' ? [] : f.type === 'int' ? 0 : f.type === 'datetime' ? local : f.type === 'select' && f.required ? f.options[0][0] : ''),
    ]),
  );
}

export default function ContentEditor() {
  const { resource, id } = useParams();
  const isNew = id === 'new';
  const schema = useSchema();
  const def = schema?.resources.find((r) => r.key === resource);
  const navigate = useNavigate();
  const notify = useToast();
  const confirm = useConfirm();
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const errorRef = useRef(null);

  useEffect(() => {
    if (!def) return;
    if (isNew) {
      const r = emptyRecord(def);
      setRecord(r);
      setSaved(r);
      return;
    }
    api
      .get(`/content/${resource}`)
      .then((rows) => {
        const r = rows.find((x) => String(x.id) === id);
        if (!r) {
          notify('That item no longer exists.', 'error');
          navigate(`/admin/content/${resource}`, { replace: true });
          return;
        }
        setRecord(r);
        setSaved(r);
      })
      .catch((e) => notify(e.message, 'error'));
  }, [def, id, isNew, resource, navigate, notify]);

  const dirty = useMemo(() => JSON.stringify(record) !== JSON.stringify(saved), [record, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!def || !record) return <Spinner />;

  const titleField = def.titleField;
  const hasSlug = def.fields.some((f) => f.name === 'slug');

  const setValue = (name, value) => {
    setRecord((r) => {
      const next = { ...r, [name]: value };
      if (hasSlug && name === titleField && !slugTouched) next.slug = slugify(value);
      return next;
    });
    if (name === 'slug') setSlugTouched(true);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const out = isNew ? await api.post(`/content/${resource}`, record) : await api.put(`/content/${resource}/${id}`, record);
      setRecord(out);
      setSaved(out);
      notify(isNew ? `${def.singular[0].toUpperCase()}${def.singular.slice(1)} created.` : 'Changes saved — the website is updated.');
      if (isNew) navigate(`/admin/content/${resource}/${out.id}`, { replace: true });
    } catch (err) {
      setErrors(err.fields || {});
      notify(err.message, 'error');
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }

  const remove = async () => {
    const ok = await confirm({ title: `Delete “${record[titleField]}”?`, message: 'This can’t be undone.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await api.del(`/content/${resource}/${id}`);
      setSaved(record);
      notify('Deleted.');
      navigate(`/admin/content/${resource}`, { replace: true });
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const leave = async () => {
    if (dirty && !(await confirm({ title: 'Discard unsaved changes?', confirmLabel: 'Discard', danger: true }))) return;
    navigate(`/admin/content/${resource}`);
  };

  const errorKeys = Object.keys(errors).filter((k) => errors[k]);

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title={isNew ? `New ${def.singular}` : record[titleField] || `Edit ${def.singular}`} description={def.label}>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={leave}>
          <Icon name="arrowLeft" size={16} /> Back
        </button>
        <button type="submit" className="adm-btn" disabled={busy || (!dirty && !isNew)}>
          {busy ? 'Saving…' : isNew ? `Create ${def.singular}` : 'Save changes'}
        </button>
      </PageHeader>

      {errorKeys.length > 0 && (
        <div className="adm-alert" tabIndex={-1} ref={errorRef} role="alert">
          <strong>Please fix the following:</strong>
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <a href={`#fld-${k}`}>
                  {def.fields.find((f) => f.name === k)?.label || k}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="adm-card adm-form-grid">
        {def.fields.map((f) => (
          <FieldInput key={f.name} field={f} value={record[f.name]} error={errors[f.name]} onChange={(v) => setValue(f.name, v)} />
        ))}
      </div>

      <div className="adm-actions adm-actions--split">
        {!isNew ? (
          <button type="button" className="adm-btn adm-btn--danger-ghost" onClick={remove}>
            <Icon name="trash" size={16} /> Delete {def.singular}
          </button>
        ) : (
          <span />
        )}
        <div className="adm-actions">
          {dirty && <span className="adm-muted">Unsaved changes</span>}
          <Link to={`/admin/content/${resource}`} className="adm-btn adm-btn--ghost" onClick={(e) => { e.preventDefault(); leave(); }}>
            Cancel
          </Link>
          <button type="submit" className="adm-btn" disabled={busy || (!dirty && !isNew)}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
