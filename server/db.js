/**
 * FoodLoop - Database Connection Pool
 * Configures node-postgres (pg) connection pool with support for transactions,
 * parameterized queries, and environment variable fallbacks.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use object-based configuration as recommended
export const pool = new Pool({
  host: process.env.PG_HOST || process.env.SQL_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || process.env.SQL_USER || 'postgres',
  password: process.env.PG_PASSWORD || process.env.SQL_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || process.env.SQL_DB_NAME || 'foodloop',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error in PostgreSQL pool:', err);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('PostgreSQL query error:', err.message);
    throw err;
  }
}

/**
 * Execute multiple database operations inside a PostgreSQL Transaction
 * Guarantees atomicity for reservation deductions and status transitions.
 * @param {Function} callback - Function receiving client: async (client) => { ... }
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

export default {
  pool,
  query,
  withTransaction,
};
