const db = require('./config/db');

async function testConnection() {
  try {
    console.log('Testing connection to MySQL database...');
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('Database connection successful! Test query result:', rows[0].result);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
