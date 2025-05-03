const mysql = require('mysql2/promise');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Create a connection pool to local MySQL instance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fetch all budgets
async function getAllBudgets() {
  const [rows] = await pool.query('SELECT * FROM budgets');
  return rows;
}

// Fetch a budget by category
async function getBudgetByCategory(category) {
  const [rows] = await pool.query(
    'SELECT * FROM budgets WHERE category = ?',
    [category]
  );
  return rows[0];
}

// Create a new budget
async function createBudget({ category, limit }) {
  const id = uuidv4();
  const spent = 0.00;
  await pool.query(
    'INSERT INTO budgets (id, category, `limit`, spent) VALUES (?, ?, ?, ?)',
    [id, category, limit, spent]
  );
  return { id, category, limit, spent };
}

// Update an existing budget's spent amount
async function updateBudget(id, { spent }) {
  await pool.query(
    'UPDATE budgets SET spent = ? WHERE id = ?',
    [spent, id]
  );
  const [rows] = await pool.query(
    'SELECT * FROM budgets WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = {
  pool,
  getAllBudgets,
  getBudgetByCategory,
  createBudget,
  updateBudget,
};
