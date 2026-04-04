const db = require('../src/config/db');

// Run migrations on test DB before all tests
beforeAll(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'viewer',
      is_active  INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS financial_records (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      amount     REAL    NOT NULL,
      type       TEXT    NOT NULL CHECK(type IN ('income','expense')),
      category   TEXT    NOT NULL,
      date       TEXT    NOT NULL,
      notes      TEXT,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
});

// Wipe tables between each test so tests don't affect each other
afterEach(() => {
  db.exec('DELETE FROM financial_records');
  db.exec('DELETE FROM users');
});

// Close DB connection after all tests
afterAll(() => {
  db.close();
});