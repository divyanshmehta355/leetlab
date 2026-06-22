const axios = require('axios');

class JDoodleExecutionService {
  constructor() {
    this.apiUrl = 'https://api.jdoodle.com/v1/execute';
  }

  async execute(language, code, input) {
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('JDoodle API credentials are not configured in .env');
    }

    try {
      // Map languages to JDoodle identifiers
      let jdoodleLang, versionIndex;
      if (language === 'javascript') {
        jdoodleLang = 'nodejs';
        versionIndex = '4'; // Node 17
      } else if (language === 'python') {
        jdoodleLang = 'python3';
        versionIndex = '4'; // Python 3.9
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }

      const payload = {
        clientId: clientId,
        clientSecret: clientSecret,
        script: code,
        stdin: input || '',
        language: jdoodleLang,
        versionIndex: versionIndex
      };

      const response = await axios.post(this.apiUrl, payload);

      // JDoodle returns statusCode 200 for execution API success
      // The output of the script is in response.data.output
      // If there is an error in execution, response.data.memory might be null, but usually output contains the error
      
      return {
        exitCode: response.data.error ? 1 : 0, // JDoodle doesn't strictly provide bash exit codes
        output: (response.data.output || '').trim()
      };
    } catch (error) {
      console.error('JDoodle Execution Error:', error.response?.data || error.message);
      throw new Error('Failed to execute code via JDoodle API');
    }
  }
}

module.exports = new JDoodleExecutionService();
