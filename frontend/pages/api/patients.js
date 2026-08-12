import { query } from '../../lib/db';
import { verifyAuth } from '../../lib/auth';
import { logAudit } from '../../lib/audit';

export default async function handler(req, res) {
  const user = verifyAuth(req, res);
  if (!user) return; // verifyAuth already handled the 401 response

  if (req.method === 'GET') {
    const { search } = req.query;

    try {
      let sql = `
        SELECT p.*, u.full_name as registered_by_name 
        FROM patients p 
        JOIN users u ON p.created_by = u.id
      `;
      const queryParams = [];

      if (search) {
        sql += `
          WHERE p.first_name LIKE ? 
             OR p.last_name LIKE ? 
             OR p.phone LIKE ? 
             OR p.email LIKE ?
        `;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      sql += ' ORDER BY p.created_at DESC';

      const patients = await query(sql, queryParams);
      return res.status(200).json(patients);
    } catch (err) {
      console.error('Get patients error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      medical_history
    } = req.body;

    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({ message: 'First name, last name, date of birth, and gender are required' });
    }

    try {
      const result = await query(
        `INSERT INTO patients 
         (first_name, last_name, date_of_birth, gender, phone, email, address, medical_history, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [
          first_name,
          last_name,
          date_of_birth,
          gender,
          phone || null,
          email || null,
          address || null,
          medical_history || null,
          user.id
        ]
      );

      const newPatientId = result[0]?.id;

      await logAudit({
        userId: user.id,
        action: 'CREATE_PATIENT',
        entityType: 'patients',
        entityId: newPatientId,
        details: JSON.stringify({ first_name, last_name, date_of_birth, gender }),
      });

      return res.status(201).json({
        message: 'Patient registered successfully',
        patientId: newPatientId
      });
    } catch (err) {
      console.error('Patient registration error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
