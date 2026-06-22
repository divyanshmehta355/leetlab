const problemService = require('../services/problemService');

class ProblemController {
  async getProblems(req, res, next) {
    try {
      const problems = await problemService.getAllProblems();
      res.status(200).json(problems);
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
