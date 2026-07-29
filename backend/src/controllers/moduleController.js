const db = require('../config/db');
const hmsModules = require('../config/hmsModules');
const { logAudit } = require('../utils/audit');

const getModuleConfig = (moduleKey) => hmsModules[moduleKey];

const getRecordPayload = (config, body) => {
  return config.fields.reduce((payload, field) => {
    let value = body[field.name];

    if (value === undefined || value === '') {
      payload[field.name] = null;
      return payload;
    }

    if (field.type === 'number') {
      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        throw new Error(`Field ${field.name} must be a valid number`);
      }
      payload[field.name] = numericValue;
      return payload;
    }

    payload[field.name] = value;
    return payload;
  }, {});
};

exports.listRecords = async (req, res) => {
  const config = getModuleConfig(req.params.module);
  if (!config) {
    return res.status(404).json({ message: 'Unknown module' });
  }

  const search = (req.query.search || '').trim();
  const params = [];
  let query = `SELECT * FROM \`${config.table}\``;

  if (search && config.searchFields.length > 0) {
    const clauses = config.searchFields.map((field) => `CAST(\`${field}\` AS CHAR) LIKE ?`);
    query += ` WHERE (${clauses.join(' OR ')})`;
    config.searchFields.forEach(() => params.push(`%${search}%`));
  }

  query += ' ORDER BY created_at DESC';

  try {
    const [records] = await db.query(query, params);
    res.json(records);
  } catch (error) {
    console.error(`List ${config.table} error:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createRecord = async (req, res) => {
  const config = getModuleConfig(req.params.module);
  if (!config) {
    return res.status(404).json({ message: 'Unknown module' });
  }

  const missingFields = config.fields
    .filter((field) => field.required && (req.body[field.name] === undefined || req.body[field.name] === ''))
    .map((field) => field.name);

  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const payload = getRecordPayload(config, req.body);
    if (Object.prototype.hasOwnProperty.call(req.body, 'recorded_by') || true) {
      payload.recorded_by = req.user?.id || null;
    }

    const columns = Object.keys(payload);
    const values = columns.map((column) => payload[column]);
    const placeholders = columns.map(() => '?').join(', ');

    const [result] = await db.query(
      `INSERT INTO \`${config.table}\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${placeholders})`,
      values
    );

    await logAudit({
      userId: req.user?.id || null,
      action: `CREATE_${config.table.toUpperCase()}`,
      entityType: config.table,
      entityId: result.insertId,
      details: JSON.stringify(payload),
    });

    res.status(201).json({
      message: `${config.label} record created successfully`,
      recordId: result.insertId,
    });
  } catch (error) {
    console.error(`Create ${config.table} error:`, error);
    res.status(400).json({ message: error.message || 'Unable to create record' });
  }
};

exports.updateRecord = async (req, res) => {
  const config = getModuleConfig(req.params.module);
  if (!config) {
    return res.status(404).json({ message: 'Unknown module' });
  }

  try {
    const payload = getRecordPayload(config, req.body);
    const columns = Object.keys(payload);

    if (columns.length === 0) {
      return res.status(400).json({ message: 'No fields were provided for update' });
    }

    const setClause = columns.map((column) => `\`${column}\` = ?`).join(', ');
    const values = columns.map((column) => payload[column]);
    values.push(req.params.id);

    const [result] = await db.query(
      `UPDATE \`${config.table}\` SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await logAudit({
      userId: req.user?.id || null,
      action: `UPDATE_${config.table.toUpperCase()}`,
      entityType: config.table,
      entityId: Number(req.params.id),
      details: JSON.stringify(payload),
    });

    res.json({ message: `${config.label} record updated successfully` });
  } catch (error) {
    console.error(`Update ${config.table} error:`, error);
    res.status(400).json({ message: error.message || 'Unable to update record' });
  }
};

exports.deleteRecord = async (req, res) => {
  const config = getModuleConfig(req.params.module);
  if (!config) {
    return res.status(404).json({ message: 'Unknown module' });
  }

  try {
    const [result] = await db.query(`DELETE FROM \`${config.table}\` WHERE id = ?`, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await logAudit({
      userId: req.user?.id || null,
      action: `DELETE_${config.table.toUpperCase()}`,
      entityType: config.table,
      entityId: Number(req.params.id),
      details: `Deleted record from ${config.table}`,
    });

    res.json({ message: `${config.label} record deleted successfully` });
  } catch (error) {
    console.error(`Delete ${config.table} error:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};