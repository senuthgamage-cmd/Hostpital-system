import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';
import { logAudit } from '../../../lib/audit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const users = await query(
      `SELECT u.id, u.username, u.password, u.full_name, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey_hms2026!',
      { expiresIn: '8h' }
    );

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'users',
      entityId: user.id,
      details: `User ${user.username} logged in`,
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_name: user.role_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
