import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { PageHeader, Spinner, formatWhen, useConfirm, useLoad, useToast } from '../ui.jsx';

const BOXES = {
  enquiries: { label: 'Enquiries', flag: 'handled', doneLabel: 'Handled', openLabel: 'New' },
  visits: { label: 'Visit requests', flag: 'handled', doneLabel: 'Handled', openLabel: 'New' },
  comments: { label: 'Blog comments', flag: 'approved', doneLabel: 'Approved', openLabel: 'Awaiting review' },
};
const INTENTS = ['general', 'visit', 'clusters', 'prayer', 'serving', 'giving', 'program', 'accessibility'];

function Item({ box, item, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const cfg = BOXES[box];
  const done = Boolean(item[cfg.flag]);
  const name = item.full_name || item.name;
  const body = item.message || item.body;
  const subject = box === 'comments' ? `Comment on “${item.post_title}”` : item.subject ? `About: ${item.subject}` : '';
  const replySubject = encodeURIComponent(box === 'enquiries' ? `Re: your ${item.intent} enquiry — Oak House Church` : 'Oak House Church');

  return (
    <li className={`adm-inbox__item ${done ? 'is-done' : ''}`}>
      <button type="button" className="adm-inbox__head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={`adm-dot ${done ? '' : 'adm-dot--new'}`} aria-hidden="true" />
        <span className="adm-inbox__who">
          <strong>{name}</strong>
          <span className="adm-muted">{item.email}</span>
        </span>
        {box === 'enquiries' && <span className="adm-tag">{item.intent}</span>}
        <span className="adm-muted adm-inbox__when">{formatWhen(item.created_at)}</span>
        <Icon name={open ? 'up' : 'down'} size={16} />
      </button>
      {open && (
        <div className="adm-inbox__body">
          {subject && <p className="adm-muted">{subject}</p>}
          {body && <p className="adm-pre">{body}</p>}
          <dl className="adm-dl">
            {item.phone && (
              <>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${item.phone}`}>{item.phone}</a>
                </dd>
              </>
            )}
            {item.source && (
              <>
                <dt>Sent from</dt>
                <dd>{item.source}</dd>
              </>
            )}
            {item.website && (
              <>
                <dt>Website</dt>
                <dd>{item.website}</dd>
              </>
            )}
            {'consent' in item && (
              <>
                <dt>Consent</dt>
                <dd>{item.consent ? 'Given' : 'Not given'}</dd>
              </>
            )}
            {item.ip && (
              <>
                <dt>IP</dt>
                <dd>{item.ip}</dd>
              </>
            )}
          </dl>
          <div className="adm-actions">
            {box !== 'comments' && (
              <a className="adm-btn adm-btn--sm" href={`mailto:${item.email}?subject=${replySubject}`}>
                Reply by email
              </a>
            )}
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => onChange(item, !done)}>
              {box === 'comments' ? (done ? 'Unpublish' : 'Approve & publish') : done ? 'Mark as new' : 'Mark as handled'}
            </button>
            <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--sm" onClick={() => onDelete(item)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function Inbox() {
  const { box } = useParams();
  const cfg = BOXES[box] || BOXES.enquiries;
  const notify = useToast();
  const confirm = useConfirm();
  const [status, setStatus] = useState('open');
  const [intent, setIntent] = useState('');
  const [q, setQ] = useState('');
  const params = new URLSearchParams({ status, ...(intent && box === 'enquiries' ? { intent } : {}), ...(q ? { q } : {}) });
  const list = useLoad(() => api.get(`/inbox/${box}?${params}`), [box, status, intent, q]);

  const change = async (item, value) => {
    try {
      await api.patch(`/inbox/${box}/${item.id}`, { [cfg.flag]: value });
      list.setData((d) => (status === 'all' ? d.map((x) => (x.id === item.id ? { ...x, [cfg.flag]: value ? 1 : 0 } : x)) : d.filter((x) => x.id !== item.id)));
      notify(box === 'comments' ? (value ? 'Comment published.' : 'Comment hidden.') : value ? 'Marked as handled.' : 'Marked as new.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async (item) => {
    if (!(await confirm({ title: 'Delete this message?', message: 'This permanently removes it and the sender’s details.', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.del(`/inbox/${box}/${item.id}`);
      list.setData((d) => d.filter((x) => x.id !== item.id));
      notify('Deleted.');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <>
      <PageHeader title="Inbox" description="Messages and requests sent from the website." />
      <nav className="adm-tabs" aria-label="Inbox folders">
        {Object.entries(BOXES).map(([key, b]) => (
          <NavLink key={key} to={`/admin/inbox/${key}`}>
            {b.label}
          </NavLink>
        ))}
      </nav>

      <div className="adm-toolbar">
        <select className="adm-input adm-input--short" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="open">{cfg.openLabel}</option>
          <option value="done">{cfg.doneLabel}</option>
          <option value="all">All</option>
        </select>
        {box === 'enquiries' && (
          <select className="adm-input adm-input--short" value={intent} onChange={(e) => setIntent(e.target.value)} aria-label="Enquiry type">
            <option value="">All types</option>
            {INTENTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        )}
        <input className="adm-input" type="search" placeholder="Search name, email or message" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && setQ(e.currentTarget.value.trim())} onBlur={(e) => setQ(e.currentTarget.value.trim())} aria-label="Search" />
      </div>

      {list.status === 'loading' && !list.data && <Spinner />}
      {list.error && <p className="adm-alert">{list.error.message}</p>}
      {list.data && (
        <ul className="adm-inbox">
          {list.data.map((item) => (
            <Item key={item.id} box={box} item={item} onChange={change} onDelete={remove} />
          ))}
          {!list.data.length && <li className="adm-empty">Nothing here. You’re all caught up.</li>}
        </ul>
      )}
    </>
  );
}
