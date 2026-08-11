import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const patients = await query(
      'SELECT id, first_name, last_name, email, created_at FROM patients ORDER BY id DESC LIMIT 10'
    );

    return res.status(200).json({ patients });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to load patients',
      details: error.message,
    });
  }
}
