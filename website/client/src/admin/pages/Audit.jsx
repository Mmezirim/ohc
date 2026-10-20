import { api } from '../api.js';
import { PageHeader, Spinner, formatWhen, useLoad } from '../ui.jsx';

const describe = (row) => {
  let d = {};
  try {
    d = JSON.parse(row.details || '{}') || {};
  } catch {
    /* ignore */
  }
  return d.title || d.filename || d.email || (d.keys ? d.keys.join(', ') : '') || d.reason || '';
};

export default function Audit() {
  const list = useLoad(() => api.get('/audit'));
  return (
    <>
      <PageHeader title="Activity log" description="The last 300 sign-ins and changes made in the admin panel." />
      {list.status === 'loading' && !list.data && <Spinner />}
      {list.data && (
        <div className="adm-card adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">Action</th>
                <th scope="col">What</th>
                <th scope="col">IP</th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((r) => (
                <tr key={r.id} className={/failed|locked/.test(r.action) ? 'is-warn' : ''}>
                  <td>{formatWhen(r.created_at)}</td>
                  <td>{r.user_email || '—'}</td>
                  <td>{r.action.replace(/_/g, ' ')}</td>
                  <td>
                    {r.entity ? `${r.entity.replace(/_/g, ' ')}${r.entity_id ? ` #${r.entity_id}` : ''}` : ''} {describe(r)}
                  </td>
                  <td>{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
