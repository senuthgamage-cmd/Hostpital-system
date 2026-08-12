import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';
import { logAudit } from '../../../lib/audit';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, role_id, full_name } = req.body;

  if (!username || !password || !role_id || !full_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const roles = await query('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (roles.length === 0) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (username, password, role_id, full_name) VALUES (?, ?, ?, ?) RETURNING id',
      [username, hashedPassword, role_id, full_name]
    );

    const newUserId = result[0]?.id;

    // Optional auth check for audit logger (if created by an existing admin)
    const activeUser = verifyAuth(req, res);

    await logAudit({
      userId: activeUser?.id || null,
      action: 'CREATE_USER',
      entityType: 'users',
      entityId: newUserId,
      details: JSON.stringify({ username, role_id, full_name }),
    });

    return res.status(201).json({
      message: 'User registered successfully',
      userId: newUserId,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
