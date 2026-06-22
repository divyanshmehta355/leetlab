const { pool } = require('../config/db');

class SubmissionRepository {
  async createSubmission(userId, problemId, language, code) {
    const query = `
      INSERT INTO submissions (user_id, problem_id, language, code)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId, problemId, language, code]);
    return rows[0];
  }

  async updateSubmissionStatus(id, status, executionTime, memoryUsed) {
    const query = `
      UPDATE submissions
      SET status = $2, execution_time_ms = $3, memory_used_kb = $4
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, status, executionTime, memoryUsed]);
    return rows[0];
  }

  async getSubmissionById(id) {
    const query = 'SELECT * FROM submissions WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async getTestCasesForProblem(problemId) {
    const query = 'SELECT * FROM test_cases WHERE problem_id = $1;';
    const { rows } = await pool.query(query, [problemId]);
    return rows;
  }
}

module.exports = new SubmissionRepository();
