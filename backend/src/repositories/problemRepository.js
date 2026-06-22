const { pool } = require('../config/db');

class ProblemRepository {
  async findAll() {
    const query = 'SELECT id, title, slug, difficulty, created_at FROM problems ORDER BY id ASC;';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = 'SELECT * FROM problems WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async findBySlug(slug) {
    const query = 'SELECT * FROM problems WHERE slug = $1;';
    const { rows } = await pool.query(query, [slug]);
    return rows[0];
  }
}

module.exports = new ProblemRepository();
