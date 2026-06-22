require('dotenv').config();
const jd = require('./src/services/jdoodleExecutionService');

const code = `
const fs = require('fs');
try {
  const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
  console.log('INPUT LENGTH:', input.length);
  console.log('INPUT:', input);
} catch(e) {
  console.log('ERROR:', e.message);
}
`;

jd.execute('javascript', code, '[2,7,11,15]\n9')
  .then(res => console.log('RESULT:', res))
  .catch(err => console.error('FAILED:', err));
