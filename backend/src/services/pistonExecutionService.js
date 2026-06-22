const axios = require('axios');

class PistonExecutionService {
  constructor() {
    // Point to the custom URL provided in .env, or fallback to the public Piston API
    this.apiUrl = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
  }

  async execute(language, code, input) {
    try {
      // Piston aliases: 'javascript' -> 'js', 'python' -> 'python'
      const langAlias = language === 'javascript' ? 'js' : language;
      
      const payload = {
        language: langAlias,
        version: '*',
        files: [
          {
            name: `solution.${langAlias === 'js' ? 'js' : 'py'}`,
            content: code
          }
        ],
        stdin: input || '',
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      };

      const response = await axios.post(this.apiUrl, payload);

      const { run } = response.data;
      
      return {
        exitCode: run.code,
        output: run.output.trim()
      };
    } catch (error) {
      console.error('Piston Execution Error:', error.response?.data || error.message);
      throw new Error('Failed to execute code via Piston API');
    }
  }
}

module.exports = new PistonExecutionService();
