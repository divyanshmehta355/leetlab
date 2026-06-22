const userRepository = require('../repositories/userRepository');
const redis = require('../config/redis');
const jwt = require('jsonwebtoken');

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { username, email, bio, github_url, website_url } = req.body;
      const currentUser = await userRepository.findById(req.user.id);

      // Check if username changed and is taken
      if (username !== currentUser.username) {
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) return res.status(400).json({ error: 'Username is already taken.' });
      }

      // Check if email changed and is taken
      if (email !== currentUser.email) {
        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) return res.status(400).json({ error: 'Email is already registered.' });
      }

      const updatedUser = await userRepository.updateProfile(req.user.id, username, email, bio, github_url, website_url);
      
      // Invalidate old and new profile cache
      await redis.del(`profile:${currentUser.username}`);
      await redis.del(`profile:${updatedUser.username}`);

      // Generate new token
      const payload = {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      await userRepository.deleteUser(req.user.id);

      // Clean up caches
      await redis.del(`profile:${user.username}`);
      await redis.del('leaderboard:all');

      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
