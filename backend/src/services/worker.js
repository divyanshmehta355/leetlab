const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const submissionRepository = require('../repositories/submissionRepository');
const pistonExecutionService = require('./pistonExecutionService');

const worker = new Worker('submissions', async job => {
  const { submissionId, problemId, language, code } = job.data;
  const startTime = Date.now();
  let finalStatus = 'Accepted';
  let hasError = false;

  console.log(`Processing submission ${submissionId}...`);

  try {
    const testCases = await submissionRepository.getTestCasesForProblem(problemId);

    for (const testCase of testCases) {
      const result = await pistonExecutionService.execute(language, code, testCase.input);

      if (result.exitCode !== 0) {
        finalStatus = 'Error';
        hasError = true;
        console.error(`Execution Error for ${submissionId}:`, result.output);
        break;
      }

      if (result.output !== testCase.expected_output) {
        finalStatus = 'Wrong Answer';
        hasError = true;
        console.log(`Wrong Answer for ${submissionId}. Expected: ${testCase.expected_output}, Got: ${result.output}`);
        break;
      }
    }
  } catch (error) {
    console.error(`Fatal error evaluating submission ${submissionId}:`, error);
    finalStatus = 'Error';
    hasError = true;
  }

  const executionTime = Date.now() - startTime;
  const memoryUsedKb = 0; // Requires more complex docker stats parsing, stubbed for now

  await submissionRepository.updateSubmissionStatus(submissionId, finalStatus, executionTime, memoryUsedKb);
  console.log(`Finished submission ${submissionId} with status ${finalStatus}`);

}, { connection: redisConfig });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = worker;
