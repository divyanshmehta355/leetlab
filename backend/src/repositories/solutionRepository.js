const { pool } = require('../config/db');

class SolutionRepository {
  async getSolutionsByProblemId(problemId, userId = null) {
    // If userId is provided, we can also check if the user has upvoted this solution
    const query = `
      SELECT 
        s.id, s.title, s.content, s.language, s.upvotes, s.created_at,
        u.username,
        (SELECT COUNT(*) FROM solution_upvotes su WHERE su.solution_id = s.id AND su.user_id = $2)::int AS has_upvoted
      FROM solutions s
      JOIN users u ON s.user_id = u.id
      WHERE s.problem_id = $1
      ORDER BY s.upvotes DESC, s.created_at DESC;
    `;
    const { rows } = await pool.query(query, [problemId, userId]);
    return rows;
  }

  async createSolution(problemId, userId, title, content, language) {
    const query = `
      INSERT INTO solutions (problem_id, user_id, title, content, language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [problemId, userId, title, content, language]);
    return rows[0];
  }

  async toggleUpvote(solutionId, userId) {
    // Check if upvote exists
    const checkQuery = 'SELECT 1 FROM solution_upvotes WHERE solution_id = $1 AND user_id = $2';
    const checkRes = await pool.query(checkQuery, [solutionId, userId]);

    if (checkRes.rows.length > 0) {
      // Remove upvote
      await pool.query('DELETE FROM solution_upvotes WHERE solution_id = $1 AND user_id = $2', [solutionId, userId]);
      await pool.query('UPDATE solutions SET upvotes = upvotes - 1 WHERE id = $1', [solutionId]);
      return { upvoted: false };
    } else {
      // Add upvote
      await pool.query('INSERT INTO solution_upvotes (solution_id, user_id) VALUES ($1, $2)', [solutionId, userId]);
      await pool.query('UPDATE solutions SET upvotes = upvotes + 1 WHERE id = $1', [solutionId]);
      return { upvoted: true };
    }
  }
}

module.exports = new SolutionRepository();
