const solutionRepository = require('../repositories/solutionRepository');

class SolutionController {
  async getSolutions(req, res, next) {
    try {
      const { problemId } = req.params;
      const userId = req.user?.id || null; // Will be set if authMiddleware (optional variant) is used
      
      const solutions = await solutionRepository.getSolutionsByProblemId(problemId, userId);
      res.status(200).json(solutions);
    } catch (error) {
      next(error);
    }
  }

  async createSolution(req, res, next) {
    try {
      const { problemId } = req.params;
      const { title, content, language } = req.body;
      const userId = req.user.id; // Requires authMiddleware

      if (!title || !content || !language) {
        return res.status(400).json({ error: 'Title, content, and language are required.' });
      }

      const solution = await solutionRepository.createSolution(problemId, userId, title, content, language);
      res.status(201).json(solution);
    } catch (error) {
      next(error);
    }
  }

  async toggleUpvote(req, res, next) {
    try {
      const { solutionId } = req.params;
      const userId = req.user.id; // Requires authMiddleware

      const result = await solutionRepository.toggleUpvote(solutionId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SolutionController();
