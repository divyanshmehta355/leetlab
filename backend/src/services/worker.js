const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const submissionRepository = require('../repositories/submissionRepository');
const jdoodleExecutionService = require('./jdoodleExecutionService');

const worker = new Worker('submissions', async job => {
  const { submissionId, problemId, language, code } = job.data;
  const startTime = Date.now();
  let finalStatus = 'Accepted';
  let hasError = false;

  console.log(`Processing submission ${submissionId}...`);

  try {
    const testCases = await submissionRepository.getTestCasesForProblem(problemId);
    
    // Fetch problem slug to know which function to call
    const { pool } = require('../config/db');
    const problemRes = await pool.query('SELECT slug FROM problems WHERE id = $1', [problemId]);
    const slug = problemRes.rows[0].slug;

    // Dynamically inject the runner boilerplate so the user doesn't have to see it or risk deleting it
    let finalCode = code;
    if (language === 'javascript') {
      if (slug === 'two-sum') {
        finalCode += `\n
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const result = twoSum(JSON.parse(input[0]), JSON.parse(input[1]));
  if (result !== undefined) console.log(JSON.stringify(result).replace(/,/g, ', '));
}`;
      } else if (slug === 'valid-palindrome') {
        finalCode += `\n
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();
if (input) {
  const result = isPalindrome(JSON.parse(input));
  if (result !== undefined) console.log(result);
}`;
      }
    }

    for (const testCase of testCases) {
      const result = await jdoodleExecutionService.execute(language, finalCode, testCase.input);

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
