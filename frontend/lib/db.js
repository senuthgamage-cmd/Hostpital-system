import { Pool } from 'pg';

function getConnectionConfig() {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.PG_CONNECTION_STRING ||
    `postgres://${process.env.SUPABASE_DB_USER || process.env.DB_USER || 'postgres'}:${process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres'}@${process.env.SUPABASE_DB_HOST || process.env.DB_HOST || 'localhost'}:${process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432}/${process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'hms_db'}`;

  const ssl = process.env.DB_SSL === 'false'
    ? false
    : {
        rejectUnauthorized: false,
      };

  return {
    connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('neon.tech') || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL ? ssl : false,
  };
}

const pool = new Pool(getConnectionConfig());

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function getDbHealth() {
  const rows = await query('SELECT 1 AS ok');
  return rows[0];
}
