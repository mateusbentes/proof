const { pool } = require('./connection');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  try {
    const initSqlPath = path.join(__dirname, '../../db/init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf8');

    await pool.query(sql);
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
