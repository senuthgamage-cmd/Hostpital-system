import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';
import { logAudit } from '../../../lib/audit';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = verifyAuth(req, res);
  if (!user) return; // verifyAuth already handled the 401 response

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    const users = await query('SELECT id, password, username FROM users WHERE id = ?', [user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dbUser = users[0];
    const isMatch = await bcrypt.compare(current_password, dbUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    await logAudit({
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'users',
      entityId: user.id,
      details: `Password changed for ${dbUser.username}`,
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
