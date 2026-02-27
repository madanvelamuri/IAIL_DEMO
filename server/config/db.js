const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// ============================
// CREATE USERS TABLE
// ============================

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)
`);

// ============================
// CREATE MISTAKES TABLE
// ============================

db.run(`
CREATE TABLE IF NOT EXISTS mistakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claim_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  mistake_type TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

module.exports = db;