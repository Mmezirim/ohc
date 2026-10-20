import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { useSchema } from '../AdminApp.jsx';
import { PageHeader, Spinner, formatWhen, useConfirm, useLoad, useToast } from '../ui.jsx';

export default function ContentList() {
  const { resource } = useParams();
  const schema = useSchema();
  const def = schema?.resources.find((r) => r.key === resource);
  const notify = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const list = useLoad(() => api.get(`/content/${resource}`), [resource]);
  const sortable = def?.fields.some((f) => f.name === 'sort_order');

  const rows = useMemo(() => {
    const items = list.data || [];
    if (!q.trim() || !def) return items;
    const needle = q.toLowerCase();
    return items.filter((r) => `${r[def.titleField]} ${r[def.subtitleField] ?? ''}`.toLowerCase().includes(needle));
  }, [list.data, q, def]);

  if (!def) return <Spinner />;

  const move = async (index, dir) => {
    const items = [...list.data];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    list.setData(items);
    try {
      await api.post(`/content/${resource}/reorder`, { ids: items.map((r) => r.id) });
    } catch (e) {
      notify(e.message, 'error');
      list.reload();
    }
  };

  const remove = async (row) => {
    const ok = await confirm({
      title: `Delete “${row[def.titleField]}”?`,
      message: 'This removes it from the website immediately and can’t be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/content/${resource}/${row.id}`);
      list.setData((d) => d.filter((r) => r.id !== row.id));
      notify('Deleted.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const subtitle = (row) => {
    const v = row[def.subtitleField];
    if (!v) return '';
    return def.fields.find((f) => f.name === def.subtitleField)?.type === 'datetime' ? formatWhen(v) : v;
  };

  return (
    <>
      <PageHeader title={def.label} description={`${list.data?.length ?? '…'} ${def.label.toLowerCase()} on the website.`}>
        <Link to={`/admin/content/${resource}/new`} className="adm-btn">
          <Icon name="plus" size={16} /> Add {def.singular}
        </Link>
      </PageHeader>

      <div className="adm-toolbar">
        <input className="adm-input" type="search" placeholder={`Search ${def.label.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      </div>

      {list.status === 'loading' && !list.data && <Spinner />}
      {list.error && <p className="adm-alert">{list.error.message}</p>}

      {list.data && (
        <ul className="adm-list">
          {rows.map((row) => (
            <li key={row.id} className="adm-list__item">
              {def.imageField && (row[def.imageField] ? <img src={row[def.imageField]} alt="" className="adm-thumb" loading="lazy" /> : <span className="adm-thumb adm-thumb--empty" />)}
              <Link to={`/admin/content/${resource}/${row.id}`} className="adm-list__main">
                <strong>{row[def.titleField] || '(untitled)'}</strong>
                <span className="adm-muted">{subtitle(row)}</span>
              </Link>
              {'active' in row && !row.active && <span className="adm-tag adm-tag--muted">Hidden</span>}
              <div className="adm-actions">
                {sortable && !q && (
                  <>
                    <button type="button" className="adm-icon-btn" onClick={() => move(list.data.indexOf(row), -1)} aria-label={`Move ${row[def.titleField]} up`}>
                      <Icon name="up" size={18} />
                    </button>
                    <button type="button" className="adm-icon-btn" onClick={() => move(list.data.indexOf(row), 1)} aria-label={`Move ${row[def.titleField]} down`}>
                      <Icon name="down" size={18} />
                    </button>
                  </>
                )}
                <Link to={`/admin/content/${resource}/${row.id}`} className="adm-icon-btn" aria-label={`Edit ${row[def.titleField]}`}>
                  <Icon name="edit" size={18} />
                </Link>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(row)} aria-label={`Delete ${row[def.titleField]}`}>
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </li>
          ))}
          {!rows.length && <li className="adm-empty">{q ? 'Nothing matches your search.' : `No ${def.label.toLowerCase()} yet.`}</li>}
        </ul>
      )}
    </>
  );
}
