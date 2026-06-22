const userRepository = require('../repositories/userRepository');
const redis = require('../config/redis');

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
      const { bio, github_url, website_url } = req.body;
      const updatedUser = await userRepository.updateProfile(req.user.id, bio, github_url, website_url);
      
      // Invalidate profile cache
      await redis.del(`profile:${updatedUser.username}`);

      res.json(updatedUser);
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
