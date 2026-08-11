const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
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

async function setup() {
  try {
    console.log('Connecting to Supabase PostgreSQL server...');

    const client = new Client(getConnectionConfig());

    await client.connect();

    console.log('Reading schema.postgres.sql file...');
    const schemaPath = path.join(__dirname, '../../schema.postgres.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema setup and seeding initial user...');
    await client.query(schemaSql);

    console.log('Database and tables set up successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();
