const { pool } = require('../config/db');
const redis = require('../config/redis');

class AdminController {
  async createProblem(req, res, next) {
    try {
      const { title, slug, difficulty, description, starter_codes, runner_boilerplates } = req.body;
      
      const result = await pool.query(
        'INSERT INTO problems (title, slug, difficulty, description, starter_codes, runner_boilerplates) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, slug, difficulty, description, starter_codes, runner_boilerplates]
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
  async getProblems(req, res, next) {
    try {
      const result = await pool.query('SELECT id, title, slug, difficulty, created_at FROM problems ORDER BY id DESC');
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  async getProblem(req, res, next) {
    try {
      const { id } = req.params;
      const problemRes = await pool.query('SELECT * FROM problems WHERE id = $1', [id]);
      if (problemRes.rows.length === 0) return res.status(404).json({ error: 'Problem not found' });
      
      const testcaseRes = await pool.query('SELECT * FROM test_cases WHERE problem_id = $1', [id]);
      
      const problem = problemRes.rows[0];
      problem.testcases = testcaseRes.rows;
      res.status(200).json(problem);
    } catch (error) {
      next(error);
    }
  }

  async updateProblem(req, res, next) {
    try {
      const { id } = req.params;
      const { title, slug, difficulty, description, starter_codes, runner_boilerplates } = req.body;
      
      const result = await pool.query(
        'UPDATE problems SET title=$1, slug=$2, difficulty=$3, description=$4, starter_codes=$5, runner_boilerplates=$6 WHERE id=$7 RETURNING *',
        [title, slug, difficulty, description, starter_codes, runner_boilerplates, id]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Problem not found' });
      
      // Delete old testcases
      await pool.query('DELETE FROM test_cases WHERE problem_id = $1', [id]);
      
      await redis.del('problems:all');
      await redis.del(`problem:${slug}`);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async deleteProblem(req, res, next) {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM problems WHERE id = $1 RETURNING slug', [id]);
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Problem not found' });
      
      await redis.del('problems:all');
      await redis.del(`problem:${result.rows[0].slug}`);
      res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
