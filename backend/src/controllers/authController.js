const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password.' });
      }
      
      const result = await authService.register(username, email, password);
      res.status(201).json(result);
    } catch (error) {
      if (error.message.includes('already')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
      }

      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('Invalid')) {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
