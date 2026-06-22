const { pool } = require('../config/db');

class ProblemRepository {
  async findAll() {
    const query = 'SELECT id, title, slug, difficulty, created_at FROM problems ORDER BY id ASC;';
    const { rows } = await pool.query(query);
    return rows;
  }

  async findPaginated(page, limit, search, difficulty) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`title ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (difficulty) {
      conditions.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination metadata
    const countQuery = `SELECT COUNT(*) FROM problems ${whereClause};`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const dataQuery = `
      SELECT id, title, slug, difficulty, created_at 
      FROM problems 
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const { rows } = await pool.query(dataQuery, [...params, limit, offset]);

    return {
      problems: rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
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
