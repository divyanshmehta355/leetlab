const { pool } = require('../config/db');
const redis = require('../config/redis');

class AdminController {
  async createProblem(req, res, next) {
    try {
      const { title, slug, difficulty, description, starter_code, runner_boilerplate_js } = req.body;
      
      const result = await pool.query(
        'INSERT INTO problems (title, slug, difficulty, description, starter_code, runner_boilerplate_js) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, slug, difficulty, description, starter_code, runner_boilerplate_js]
      );
      
      await redis.del('problems:all');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async addTestCase(req, res, next) {
    try {
      const { id } = req.params;
      const { input, expected_output } = req.body;

      const result = await pool.query(
        'INSERT INTO test_cases (problem_id, input, expected_output) VALUES ($1, $2, $3) RETURNING *',
        [id, input, expected_output]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
