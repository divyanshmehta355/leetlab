const leaderboardRepository = require('../repositories/leaderboardRepository');
const redis = require('../config/redis');

class LeaderboardController {
  async getLeaderboard(req, res, next) {
    try {
      const cacheKey = 'leaderboard:all';
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const leaderboard = await leaderboardRepository.getTopUsers(100);
      
      // Cache for 5 minutes
      await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', 300);
      
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaderboardController();
