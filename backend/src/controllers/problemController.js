const problemService = require('../services/problemService');

class ProblemController {
  async getProblems(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      const search = req.query.search || '';
      const difficulty = req.query.difficulty || '';

      const result = await problemService.getAllProblems(page, limit, search, difficulty);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProblem(req, res, next) {
    try {
      const { slug } = req.params;
      const problem = await problemService.getProblemBySlug(slug);
      res.status(200).json(problem);
    } catch (error) {
      if (error.message === 'Problem not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new ProblemController();
