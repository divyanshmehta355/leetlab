const userProfileRepository = require('../repositories/userProfileRepository');
const redis = require('../config/redis');

class UserProfileController {
  async getProfile(req, res, next) {
    try {
      const { username } = req.params;
      
      // Simple cache to prevent heavy querying on popular profiles
      const cacheKey = `profile:${username}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const profileData = await userProfileRepository.getUserProfile(username);
      if (!profileData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Cache for 2 minutes
      await redis.set(cacheKey, JSON.stringify(profileData), 'EX', 120);

      res.status(200).json(profileData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserProfileController();
