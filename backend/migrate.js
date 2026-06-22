const { pool } = require('./src/config/db');
const redis = require('./src/config/redis');

(async () => {
  try {
    await pool.query('ALTER TABLE problems ADD COLUMN IF NOT EXISTS runner_boilerplate_js TEXT');

    const twoSumBoilerplate = `
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const result = twoSum(JSON.parse(input[0]), JSON.parse(input[1]));
  if (result !== undefined) console.log(JSON.stringify(result).replace(/,/g, ', '));
}`;

    const palindromeBoilerplate = `
const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();
if (input) {
  const result = isPalindrome(JSON.parse(input));
  if (result !== undefined) console.log(result);
}`;

    await pool.query('UPDATE problems SET runner_boilerplate_js = $1 WHERE slug = $2', [twoSumBoilerplate, 'two-sum']);
    await pool.query('UPDATE problems SET runner_boilerplate_js = $1 WHERE slug = $2', [palindromeBoilerplate, 'valid-palindrome']);

    await redis.del('problems:all', 'problem:two-sum', 'problem:valid-palindrome');
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    pool.end();
    process.exit(0);
  }
})();
