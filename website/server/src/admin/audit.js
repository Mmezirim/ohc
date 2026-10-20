import { query } from '../db.js';

/** Records an admin action. Never throws — auditing must not break the request. */
export async function audit(req, action, { entity = null, entityId = null, details = null, user = req.admin } = {}) {
  try {
    await query('INSERT INTO audit_log SET ?', [
      {
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        action,
        entity,
        entity_id: entityId == null ? null : String(entityId),
        details: details == null ? null : JSON.stringify(details).slice(0, 4000),
        ip: req.ip,
      },
    ]);
  } catch (err) {
    console.warn('[audit] failed:', err.message);
  }
}
