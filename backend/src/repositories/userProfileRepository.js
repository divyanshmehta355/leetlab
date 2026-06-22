const { pool } = require('../config/db');

class UserProfileRepository {
  async getUserProfile(username) {
    // 1. Get basic user info
    const userQuery = 'SELECT id, username, bio, github_url, website_url, created_at FROM users WHERE username = $1';
    const userRes = await pool.query(userQuery, [username]);
    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // 2. Get problem stats and points
    const statsQuery = `
      WITH unique_solves AS (
          SELECT DISTINCT problem_id
          FROM submissions
          WHERE user_id = $1 AND status = 'Accepted'
      )
      SELECT 
          COUNT(us.problem_id)::int AS total_solved,
          SUM(CASE WHEN p.difficulty = 'Easy' THEN 1 ELSE 0 END)::int AS easy_solved,
          SUM(CASE WHEN p.difficulty = 'Medium' THEN 1 ELSE 0 END)::int AS medium_solved,
          SUM(CASE WHEN p.difficulty = 'Hard' THEN 1 ELSE 0 END)::int AS hard_solved,
          SUM(
              CASE 
                  WHEN p.difficulty = 'Easy' THEN 10 
                  WHEN p.difficulty = 'Medium' THEN 30 
                  WHEN p.difficulty = 'Hard' THEN 50 
                  ELSE 0 
              END
          )::int AS total_points
      FROM unique_solves us
      JOIN problems p ON us.problem_id = p.id;
    `;
    const statsRes = await pool.query(statsQuery, [user.id]);
    const stats = statsRes.rows[0];

    // 3. Get total problem counts (for progress bars)
    const totalQuery = `
      SELECT 
        COUNT(*)::int AS total_problems,
        SUM(CASE WHEN difficulty = 'Easy' THEN 1 ELSE 0 END)::int AS total_easy,
        SUM(CASE WHEN difficulty = 'Medium' THEN 1 ELSE 0 END)::int AS total_medium,
        SUM(CASE WHEN difficulty = 'Hard' THEN 1 ELSE 0 END)::int AS total_hard
      FROM problems;
    `;
    const totalRes = await pool.query(totalQuery);
    const totals = totalRes.rows[0];

    // 4. Get global rank (calculated on the fly or from a view, here computed fast)
    const rankQuery = `
      WITH user_scores AS (
        SELECT 
            u.id, 
            SUM(
                CASE 
                    WHEN p.difficulty = 'Easy' THEN 10 
                    WHEN p.difficulty = 'Medium' THEN 30 
                    WHEN p.difficulty = 'Hard' THEN 50 
                    ELSE 0 
                END
            )::int AS total_points
        FROM users u
        LEFT JOIN (
            SELECT DISTINCT user_id, problem_id 
            FROM submissions WHERE status = 'Accepted'
        ) us ON u.id = us.user_id
        LEFT JOIN problems p ON us.problem_id = p.id
        GROUP BY u.id
      )
      SELECT rank FROM (
        SELECT id, total_points, RANK() OVER (ORDER BY COALESCE(total_points, 0) DESC) as rank
        FROM user_scores
      ) ranked WHERE id = $1;
    `;
    const rankRes = await pool.query(rankQuery, [user.id]);
    const globalRank = rankRes.rows[0]?.rank || null;

    // 5. Get recent accepted activity
    const activityQuery = `
      SELECT s.id, s.language, s.created_at, p.title, p.difficulty, p.slug
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = $1 AND s.status = 'Accepted'
      ORDER BY s.created_at DESC
      LIMIT 10;
    `;
    const activityRes = await pool.query(activityQuery, [user.id]);
    const recentActivity = activityRes.rows;

    return {
      user: {
        id: user.id,
        username: user.username,
        bio: user.bio,
        github_url: user.github_url,
        website_url: user.website_url,
        joined_at: user.created_at
      },
      stats: {
        ...stats,
        total_points: stats.total_points || 0,
        global_rank: globalRank
      },
      totals,
      recentActivity
    };
  }
}

module.exports = new UserProfileRepository();
