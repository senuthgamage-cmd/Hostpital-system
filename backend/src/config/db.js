const { Pool } = require('pg');
require('dotenv').config();

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

function normalizeQuery(text, params = []) {
  const values = Array.isArray(params) ? params : [params];
  let index = 0;
  const sql = String(text).replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
  return { sql, values };
}

async function query(text, params = []) {
  const { sql, values } = normalizeQuery(text, params);
  const result = await pool.query(sql, values);

  if (result.command === 'SELECT') {
    return [result.rows, result.fields];
  }

  if (result.command === 'INSERT') {
    const insertId = result.rows?.[0]?.id ?? result.insertId ?? result.rowCount;
    return [{ insertId, affectedRows: result.rowCount, rowCount: result.rowCount }, result.fields];
  }

  if (result.command === 'UPDATE' || result.command === 'DELETE') {
    return [{ affectedRows: result.rowCount, rowCount: result.rowCount }, result.fields];
  }

  return [result.rows, result.fields];
}

module.exports = { query, pool };
