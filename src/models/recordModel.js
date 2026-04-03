const db = require('../config/db');

const recordModel = {
  create({ amount, type, category, date, notes, created_by }) {
    const stmt = db.prepare(`
      INSERT INTO financial_records (amount, type, category, date, notes, created_by)
      VALUES (@amount, @type, @category, @date, @notes, @created_by)
    `);
    const result = stmt.run({ amount, type, category, date, notes: notes || null, created_by });
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    return db.prepare(
      'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0'
    ).get(id);
  },

  findAll(filters = {}) {
    let query = 'SELECT * FROM financial_records WHERE is_deleted = 0';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.from) {
      query += ' AND date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND date <= ?';
      params.push(filters.to);
    }

    query += ' ORDER BY date DESC';

    // Pagination
    const limit  = parseInt(filters.limit)  || 20;
    const offset = parseInt(filters.offset) || 0;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  },

  update(id, fields) {
    const allowed = ['amount', 'type', 'category', 'date', 'notes'];
    const updates = Object.keys(fields)
      .filter(k => allowed.includes(k))
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!updates) return this.findById(id);

    db.prepare(`
      UPDATE financial_records SET ${updates}, updated_at = datetime('now')
      WHERE id = @id AND is_deleted = 0
    `).run({ ...fields, id });

    return this.findById(id);
  },

  // Soft delete
  softDelete(id) {
    db.prepare(`
      UPDATE financial_records SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?
    `).run(id);
  },

  // For dashboard aggregations — no pagination
  findAllForSummary(filters = {}) {
    let query = 'SELECT * FROM financial_records WHERE is_deleted = 0';
    const params = [];

    if (filters.from) { query += ' AND date >= ?'; params.push(filters.from); }
    if (filters.to)   { query += ' AND date <= ?'; params.push(filters.to); }

    return db.prepare(query).all(...params);
  },
};

module.exports = recordModel;