require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

// Use in-memory DB during tests, file DB otherwise
const db = process.env.NODE_ENV === 'test'
  ? new Database(':memory:')
  : new Database(path.join(__dirname, '../../db/finance.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;