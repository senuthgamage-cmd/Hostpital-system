import { query } from './db';

export async function logAudit({ userId = null, action, entityType = null, entityId = null, details = null }) {
  try {
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, entityType, entityId, details]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
