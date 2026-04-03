const db = require('../config/db');

const userModel = {
  create({ name, email, password, role = 'viewer' }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (@name, @email, @password, @role)
    `);
    const result = stmt.run({ name, email, password, role });
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findAll() {
    return db.prepare('SELECT id, name, email, role, is_active, created_at FROM users').all();
  },

  update(id, fields) {
    const allowed = ['name', 'email', 'role', 'is_active'];
    const updates = Object.keys(fields)
      .filter(k => allowed.includes(k))
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!updates) return this.findById(id);

    db.prepare(`
      UPDATE users SET ${updates}, updated_at = datetime('now') WHERE id = @id
    `).run({ ...fields, id });

    return this.findById(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};

module.exports = userModel;