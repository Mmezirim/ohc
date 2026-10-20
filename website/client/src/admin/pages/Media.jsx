import { useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { PageHeader, Spinner, useConfirm, useLoad, useToast } from '../ui.jsx';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function Media() {
  const notify = useToast();
  const confirm = useConfirm();
  const list = useLoad(() => api.get('/media'));
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  async function uploadFiles(files) {
    const arr = [...files].slice(0, 20);
    setUploading(arr.length);
    for (const file of arr) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const m = await api.upload('/media', fd);
        list.setData((d) => [m, ...(d || [])]);
      } catch (e) {
        notify(`${file.name}: ${e.message}`, 'error');
      }
      setUploading((n) => n - 1);
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  const saveAlt = async (m, alt) => {
    try {
      await api.patch(`/media/${m.id}`, { alt });
      list.setData((d) => d.map((x) => (x.id === m.id ? { ...x, alt } : x)));
      notify('Description saved.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (m) => {
    const ok = await confirm({ title: `Delete ${m.filename}?`, message: 'The file is removed permanently.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await api.del(`/media/${m.id}`);
      list.setData((d) => d.filter((x) => x.id !== m.id));
      setSelected(null);
      notify('Image deleted.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const copy = async (url) => {
    await navigator.clipboard?.writeText(window.location.origin + url).catch(() => {});
    notify('Link copied.');
  };

  const items = (list.data || []).filter((m) => !q || `${m.filename} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Media library" description="Images used across the website. JPEG, PNG, WebP or GIF up to 8 MB.">
        <label className="adm-btn">
          <Icon name="plus" size={16} /> {uploading ? `Uploading ${uploading}…` : 'Upload images'}
          <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => uploadFiles(e.target.files)} />
        </label>
      </PageHeader>

      <div
        className={`adm-dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        <Icon name="image" size={22} /> Drag images here to upload
      </div>

      <div className="adm-toolbar">
        <input className="adm-input" type="search" placeholder="Search by name or description" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
      </div>

      {list.status === 'loading' && !list.data && <Spinner />}
      {list.data && (
        <div className={`adm-media-layout ${selected ? 'has-detail' : ''}`}>
          <ul className="adm-media-grid">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" className={`adm-media-tile ${selected?.id === m.id ? 'is-selected' : ''}`} onClick={() => setSelected(m)} aria-pressed={selected?.id === m.id}>
                  <img src={m.url} alt={m.alt || ''} loading="lazy" />
                  <span>{m.filename}</span>
                </button>
              </li>
            ))}
            {!items.length && <li className="adm-empty">No images found.</li>}
          </ul>

          {selected && (
            <aside className="adm-card adm-media-detail" aria-label="Image details">
              <img src={selected.url} alt={selected.alt || ''} />
              <dl className="adm-dl">
                <dt>File</dt>
                <dd>{selected.filename}</dd>
                <dt>Size</dt>
                <dd>
                  {kb(selected.size)}
                  {selected.width ? ` · ${selected.width}×${selected.height}` : ''}
                </dd>
                <dt>Source</dt>
                <dd>{selected.builtin ? 'Built into the website' : 'Uploaded'}</dd>
              </dl>
              <form
                key={selected.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAlt(selected, new FormData(e.currentTarget).get('alt'));
                }}
              >
                <div className="adm-field">
                  <label className="adm-label" htmlFor="alt">
                    Description (alt text)
                  </label>
                  <input id="alt" name="alt" className="adm-input" defaultValue={selected.alt} maxLength={255} />
                  <p className="adm-help">Describe the image for people using screen readers.</p>
                </div>
                <div className="adm-actions">
                  <button type="submit" className="adm-btn adm-btn--sm">
                    Save description
                  </button>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => copy(selected.url)}>
                    Copy link
                  </button>
                  {!selected.builtin && (
                    <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--sm" onClick={() => remove(selected)}>
                      Delete
                    </button>
                  )}
                </div>
              </form>
            </aside>
          )}
        </div>
      )}
    </>
  );
}
