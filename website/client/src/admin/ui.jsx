import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { api } from './api.js';

// ---- Toasts --------------------------------------------------------------------------------------
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.tone}`}>
            <Icon name={t.tone === 'error' ? 'info' : 'check'} size={16} /> {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ---- Confirm dialog -------------------------------------------------------------------------------
const ConfirmContext = createContext(async () => false);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const confirmRef = useRef(null);
  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setDialog({ ...opts, resolve });
      }),
    [],
  );
  useEffect(() => {
    if (!dialog) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const close = (value) => {
    dialog?.resolve(value);
    setDialog(null);
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="adm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="adm-modal__box adm-modal__box--sm">
            <h2 id="confirm-title" className="adm-h3">
              {dialog.title}
            </h2>
            {dialog.message && <p className="adm-muted">{dialog.message}</p>}
            <div className="adm-actions adm-actions--end">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => close(false)}>
                Cancel
              </button>
              <button ref={confirmRef} type="button" className={`adm-btn ${dialog.danger ? 'adm-btn--danger' : ''}`} onClick={() => close(true)}>
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

// ---- Layout bits ----------------------------------------------------------------------------------
export function PageHeader({ title, description, children }) {
  return (
    <header className="adm-page-head">
      <div>
        <h1 className="adm-h1">{title}</h1>
        {description && <p className="adm-muted">{description}</p>}
      </div>
      {children && <div className="adm-actions">{children}</div>}
    </header>
  );
}

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="adm-loading" role="status">
    <span className="adm-spinner" aria-hidden="true" /> {label}
  </div>
);

export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const reload = useCallback(async () => {
    try {
      const data = await loader();
      setState({ status: 'ready', data, error: null });
    } catch (error) {
      setState((s) => ({ status: 'error', data: s.data, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    reload();
  }, [reload]);
  return { ...state, reload, setData: (fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })) };
}

export const formatWhen = (v) => {
  if (!v) return '—';
  const d = new Date(String(v).replace(' ', 'T') + (String(v).includes('Z') || String(v).includes('+') ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

// ---- Media picker ----------------------------------------------------------------------------------
export function MediaPicker({ open, onClose, onSelect }) {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [uploading, setUploading] = useState(false);
  const notify = useToast();

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    api.get('/media').then((d) => alive && setItems(d)).catch((e) => notify(e.message, 'error'));
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, notify]);

  if (!open) return null;
  const shown = (items || []).filter((m) => !q || `${m.filename} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const m = await api.upload('/media', fd);
      onSelect(m);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal__box">
        <div className="adm-page-head adm-page-head--tight">
          <h2 id="picker-title" className="adm-h3">
            Choose an image
          </h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="adm-toolbar">
          <input className="adm-input" type="search" placeholder="Search images" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search images" />
          <label className="adm-btn">
            {uploading ? 'Uploading…' : 'Upload new'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
        {!items ? (
          <Spinner />
        ) : (
          <ul className="adm-media-grid adm-media-grid--picker">
            {shown.map((m) => (
              <li key={m.id}>
                <button type="button" className="adm-media-tile" onClick={() => onSelect(m)} title={m.filename}>
                  <img src={m.url} alt={m.alt || ''} loading="lazy" />
                  <span>{m.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---- Form fields ----------------------------------------------------------------------------------
export function FieldInput({ field, value, onChange, error, disabled }) {
  const id = `fld-${field.name}`;
  const [picking, setPicking] = useState(false);
  const describedBy = [field.help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  const common = { id, name: field.name, disabled, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy };
  let control;

  switch (field.type) {
    case 'textarea':
      control = <textarea className="adm-input" rows={4} {...common} value={value ?? ''} maxLength={field.max} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'markdown':
      control = <textarea className="adm-input adm-input--code" rows={16} {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'list':
      control = (
        <textarea
          className="adm-input"
          rows={4}
          {...common}
          value={Array.isArray(value) ? value.join('\n') : value ?? ''}
          onChange={(e) => onChange(e.target.value.split('\n'))}
        />
      );
      break;
    case 'select':
      control = (
        <select className="adm-input" {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {!field.required && !field.options.some(([v]) => v === '') && <option value="">—</option>}
          {field.options.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      );
      break;
    case 'bool':
      control = (
        <label className="adm-switch">
          <input type="checkbox" {...common} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{value ? 'Yes' : 'No'}</span>
        </label>
      );
      break;
    case 'int':
      control = <input className="adm-input adm-input--short" type="number" step="1" {...common} value={value ?? 0} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'date':
      control = <input className="adm-input adm-input--short" type="date" {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'datetime':
      control = <input className="adm-input adm-input--short" type="datetime-local" {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'image':
      control = (
        <div className="adm-image-field">
          {value ? <img src={value} alt="" /> : <div className="adm-image-field__empty">No image</div>}
          <div className="adm-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setPicking(true)} disabled={disabled} aria-describedby={describedBy}>
              {value ? 'Change image' : 'Choose image'}
            </button>
            {value && !field.required && (
              <button type="button" className="adm-btn adm-btn--text" onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
          <MediaPicker
            open={picking}
            onClose={() => setPicking(false)}
            onSelect={(m) => {
              onChange(m.url);
              setPicking(false);
            }}
          />
        </div>
      );
      break;
    default:
      control = (
        <input
          className="adm-input"
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          {...common}
          value={value ?? ''}
          maxLength={field.max}
          onChange={(e) => onChange(field.type === 'slug' ? e.target.value.toLowerCase() : e.target.value)}
        />
      );
  }

  return (
    <div className={`adm-field ${['textarea', 'markdown', 'list', 'image', 'url'].includes(field.type) ? 'adm-field--wide' : ''}`}>
      <label className="adm-label" htmlFor={id}>
        {field.label} {field.required && <span className="adm-req">required</span>}
      </label>
      {control}
      {field.help && (
        <p className="adm-help" id={`${id}-help`}>
          {field.help}
        </p>
      )}
      {error && (
        <p className="adm-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}
