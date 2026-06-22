const submissionRepository = require('../repositories/submissionRepository');
const submissionQueue = require('./submissionQueue');

class SubmissionService {
  async submitCode(userId, problemId, language, code) {
    // 1. Create a pending submission record in the DB
    const submission = await submissionRepository.createSubmission(userId, problemId, language, code);

    // 2. Add the submission to the BullMQ queue
    await submissionQueue.add('evaluate-code', {
      submissionId: submission.id,
      problemId: problemId,
      language: language,
      code: code
    });

    return submission;
  }

  async getSubmissionStatus(submissionId) {
    const submission = await submissionRepository.getSubmissionById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    return submission;
  }
}

module.exports = new SubmissionService();
