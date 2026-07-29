const db = require('../config/db');
const { logAudit } = require('../utils/audit');

// Register a new patient
exports.registerPatient = async (req, res) => {
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

  // Validation
  if (!first_name || !last_name || !date_of_birth || !gender) {
    return res.status(400).json({ message: 'First name, last name, date of birth, and gender are required' });
  }

  try {
    const creatorId = req.user.id; // From authMiddleware

    const [result] = await db.query(
      `INSERT INTO patients 
       (first_name, last_name, date_of_birth, gender, phone, email, address, medical_history, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone || null,
        email || null,
        address || null,
        medical_history || null,
        creatorId
      ]
    );

    await logAudit({
      userId: creatorId,
      action: 'CREATE_PATIENT',
      entityType: 'patients',
      entityId: result.insertId,
      details: JSON.stringify({ first_name, last_name, date_of_birth, gender }),
    });

    res.status(201).json({
      message: 'Patient registered successfully',
      patientId: result.insertId
    });
  } catch (err) {
    console.error('Patient registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Search / list patients
exports.getPatients = async (req, res) => {
  const { search } = req.query;

  try {
    let query = `
      SELECT p.*, u.full_name as registered_by_name 
      FROM patients p 
      JOIN users u ON p.created_by = u.id
    `;
    const queryParams = [];

    if (search) {
      query += `
        WHERE p.first_name LIKE ? 
           OR p.last_name LIKE ? 
           OR p.phone LIKE ? 
           OR p.email LIKE ?
      `;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY p.created_at DESC';

    const [patients] = await db.query(query, queryParams);
    res.json(patients);
  } catch (err) {
    console.error('Get patients error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
