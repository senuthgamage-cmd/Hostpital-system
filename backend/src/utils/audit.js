const db = require('../config/db');

const logAudit = async ({ userId = null, action, entityType = null, entityId = null, details = null }) => {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { logAudit };