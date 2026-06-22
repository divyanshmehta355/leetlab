const submissionService = require('../services/submissionService');

class SubmissionController {
  async submitCode(req, res, next) {
    try {
      const { problemId, language, code } = req.body;
      const userId = req.user.id; // From authMiddleware

      if (!problemId || !language || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const submission = await submissionService.submitCode(userId, problemId, language, code);
      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionStatus(req, res, next) {
    try {
      const { id } = req.params;
      const submission = await submissionService.getSubmissionStatus(id);
      
      // Optionally check if submission.user_id === req.user.id
      
      res.status(200).json(submission);
    } catch (error) {
      if (error.message === 'Submission not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new SubmissionController();
