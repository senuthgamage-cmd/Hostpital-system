import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import { logAudit } from '../../../lib/audit';
import { hmsModuleConfigs } from '../../../src/data/hmsModules';

const searchFieldsMap = {
  departments: ['name', 'description'],
  doctors: ['full_name', 'department', 'specialization', 'phone', 'email', 'status'],
  appointments: ['patient_name', 'doctor_name', 'status', 'notes'],
  admissions: ['patient_name', 'ward', 'admission_type', 'status', 'notes'],
  medical_records: ['patient_name', 'diagnosis', 'prescriptions', 'treatment_history', 'medical_reports'],
  laboratory_tests: ['patient_name', 'test_name', 'sample_collection_status', 'result_entry', 'report_generation', 'status'],
  pharmacy_items: ['medicine_name', 'prescription_processing', 'status'],
  billing_records: ['patient_name', 'invoice_number', 'status'],
  payments: ['invoice_number', 'patient_name', 'payment_method', 'status'],
  employees: ['full_name', 'role', 'department', 'attendance', 'leave_records', 'phone'],
};

const getRecordPayload = (config, body) => {
  return config.fields.reduce((payload, field) => {
    const value = body[field.name];

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

export default async function handler(req, res) {
  const { moduleKey, id } = req.query;

  const config = hmsModuleConfigs[moduleKey];
  if (!config) {
    return res.status(404).json({ message: 'Unknown module' });
  }

  const user = verifyAuth(req, res);
  if (!user) return; // verifyAuth already handled the 401 response

  const tableName = moduleKey; // table matches config key name

  // LIST / SEARCH (GET)
  if (req.method === 'GET') {
    const search = (req.query.search || '').trim();
    const params = [];
    let sql = `SELECT * FROM "${tableName}"`;

    const searchFields = searchFieldsMap[moduleKey] || [];
    if (search && searchFields.length > 0) {
      const clauses = searchFields.map((field) => `CAST("${field}" AS TEXT) LIKE ?`);
      sql += ` WHERE (${clauses.join(' OR ')})`;
      searchFields.forEach(() => params.push(`%${search}%`));
    }

    sql += ' ORDER BY created_at DESC';

    try {
      const records = await query(sql, params);
      return res.status(200).json(records);
    } catch (error) {
      console.error(`List ${tableName} error:`, error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // CREATE (POST)
  if (req.method === 'POST') {
    const missingFields = config.fields
      .filter((field) => field.required && (req.body[field.name] === undefined || req.body[field.name] === ''))
      .map((field) => field.name);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    try {
      const payload = getRecordPayload(config, req.body);
      payload.recorded_by = user.id;

      const columns = Object.keys(payload);
      const values = columns.map((column) => payload[column]);
      const placeholders = columns.map(() => '?').join(', ');

      const result = await query(
        `INSERT INTO "${tableName}" (${columns.map((col) => `"${col}"`).join(', ')}) VALUES (${placeholders}) RETURNING id`,
        values
      );

      const recordId = result[0]?.id;

      await logAudit({
        userId: user.id,
        action: `CREATE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: recordId,
        details: JSON.stringify(payload),
      });

      return res.status(201).json({
        message: `${config.title} record created successfully`,
        recordId,
      });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      return res.status(400).json({ message: error.message || 'Unable to create record' });
    }
  }

  // UPDATE (PUT)
  if (req.method === 'PUT') {
    if (!id) {
      return res.status(400).json({ message: 'Record ID is required for updates' });
    }

    try {
      const payload = getRecordPayload(config, req.body);
      const columns = Object.keys(payload);

      if (columns.length === 0) {
        return res.status(400).json({ message: 'No fields were provided for update' });
      }

      const setClause = columns.map((column) => `"${column}" = ?`).join(', ');
      const values = columns.map((column) => payload[column]);
      values.push(id);

      // Perform update query
      await query(`UPDATE "${tableName}" SET ${setClause} WHERE id = ?`, values);

      await logAudit({
        userId: user.id,
        action: `UPDATE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: Number(id),
        details: JSON.stringify(payload),
      });

      return res.status(200).json({ message: `${config.title} record updated successfully` });
    } catch (error) {
      console.error(`Update ${tableName} error:`, error);
      return res.status(400).json({ message: error.message || 'Unable to update record' });
    }
  }

  // DELETE (DELETE)
  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ message: 'Record ID is required for deletion' });
    }

    try {
      await query(`DELETE FROM "${tableName}" WHERE id = ?`, [id]);

      await logAudit({
        userId: user.id,
        action: `DELETE_${tableName.toUpperCase()}`,
        entityType: tableName,
        entityId: Number(id),
        details: `Deleted record from ${tableName}`,
      });

      return res.status(200).json({ message: `${config.title} record deleted successfully` });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
