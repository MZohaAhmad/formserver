const path = require("path");
const Database = require("better-sqlite3");

let db;

function init(dbInstance) {
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function getDb() {
  if (db) return db;
  const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data.sqlite");
  db = new Database(dbPath);
  init(db);
  return db;
}

function resetDb() {
  if (!db) return;
  try {
    db.close();
  } finally {
    db = undefined;
  }
}

module.exports = { getDb, resetDb };

