import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useSchema } from '../AdminApp.jsx';
import { PageHeader, Spinner, formatWhen, useLoad, useToast } from '../ui.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const schema = useSchema();
  const notify = useToast();
  const { status, data, error } = useLoad(() => api.get('/dashboard'));
  const [refreshing, setRefreshing] = useState(false);

  const refreshSermons = async () => {
    setRefreshing(true);
    try {
      const r = await api.post('/sermons/refresh');
      notify(`Sermons refreshed — ${r.count} latest videos loaded.`);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} description="Manage the Oak House Church website — content, media and messages from visitors.">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={refreshSermons} disabled={refreshing}>
          <Icon name="refresh" size={16} /> {refreshing ? 'Refreshing…' : 'Refresh sermons'}
        </button>
      </PageHeader>

      {status === 'loading' && !data && <Spinner />}
      {error && <p className="adm-alert">{error.message}</p>}

      {data && (
        <>
          <section className="adm-stats" aria-label="Needs attention">
            <Link to="/admin/inbox/enquiries" className="adm-stat">
              <span className="adm-stat__num">{data.open.enquiries}</span>
              <span>New enquiries</span>
            </Link>
            <Link to="/admin/inbox/visits" className="adm-stat">
              <span className="adm-stat__num">{data.open.visits}</span>
              <span>Visit requests</span>
            </Link>
            <Link to="/admin/inbox/comments" className="adm-stat">
              <span className="adm-stat__num">{data.open.comments}</span>
              <span>Comments to review</span>
            </Link>
            <Link to="/admin/media" className="adm-stat">
              <span className="adm-stat__num">{data.media}</span>
              <span>Images in library</span>
            </Link>
          </section>

          <div className="adm-two-col">
            <section className="adm-card">
              <h2 className="adm-h3">Latest enquiries</h2>
              {data.recentEnquiries.length ? (
                <ul className="adm-rows">
                  {data.recentEnquiries.map((e) => (
                    <li key={e.id}>
                      <Link to="/admin/inbox/enquiries">
                        <strong>{e.full_name}</strong>
                        <span className="adm-tag">{e.intent}</span>
                        <span className="adm-muted">{formatWhen(e.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="adm-muted">No enquiries yet. Messages sent from the Contact page will appear here.</p>
              )}
            </section>

            <section className="adm-card">
              <h2 className="adm-h3">Website content</h2>
              <ul className="adm-rows">
                {(schema?.resources || []).map((r) => (
                  <li key={r.key}>
                    <Link to={`/admin/content/${r.key}`}>
                      <strong>{r.label}</strong>
                      <span className="adm-muted">{data.content[r.key] ?? 0} items</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
}
