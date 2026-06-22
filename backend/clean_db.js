const { pool } = require('./src/config/db');
const redis = require('./src/config/redis');

(async () => {
  try {
    const twoSumJS = `function twoSum(nums, target) {\n  // Write your code here\n  \n}`;
    const palindromeJS = `function isPalindrome(s) {\n  // Write your code here\n  \n}`;

    await pool.query('UPDATE problems SET starter_code = $1 WHERE slug = $2', [twoSumJS, 'two-sum']);
    await pool.query('UPDATE problems SET starter_code = $1 WHERE slug = $2', [palindromeJS, 'valid-palindrome']);

    await redis.del('problem:two-sum', 'problem:valid-palindrome', 'problems:all');
    console.log('Cleaned DB and Cache');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
    process.exit(0);
  }
})();
