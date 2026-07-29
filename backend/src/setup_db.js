const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  try {
    console.log('Connecting to MySQL server (host: ' + (process.env.DB_HOST || 'localhost') + ', user: ' + (process.env.DB_USER || 'root') + ')...');
    
    // Create connection with multipleStatements enabled to run the entire SQL file
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Reading schema.sql file...');
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema setup and seeding initial user...');
    await connection.query(schemaSql);
    
    console.log('Database and tables set up successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();
