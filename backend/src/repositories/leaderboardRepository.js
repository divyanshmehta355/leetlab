const { pool } = require('../config/db');

class LeaderboardRepository {
  async getTopUsers(limit = 100) {
    const query = `
      WITH unique_solves AS (
          SELECT DISTINCT user_id, problem_id
          FROM submissions
          WHERE status = 'Accepted'
      )
      SELECT 
          u.id, 
          u.username,
          COUNT(us.problem_id)::int AS total_solved,
          SUM(
              CASE 
                  WHEN p.difficulty = 'Easy' THEN 10 
                  WHEN p.difficulty = 'Medium' THEN 30 
                  WHEN p.difficulty = 'Hard' THEN 50 
                  ELSE 0 
              END
          )::int AS total_points
      FROM users u
      JOIN unique_solves us ON u.id = us.user_id
      JOIN problems p ON us.problem_id = p.id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC, total_solved ASC
      LIMIT $1;
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }
}

module.exports = new LeaderboardRepository();
