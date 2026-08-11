import { getDbHealth } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const health = await getDbHealth();
    return res.status(200).json({
      status: 'ok',
      database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'supabase',
      connection: health,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      details: error.message,
    });
  }
}
