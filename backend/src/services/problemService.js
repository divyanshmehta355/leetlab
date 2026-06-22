const problemRepository = require('../repositories/problemRepository');
const redis = require('../config/redis');

class ProblemService {
  async getAllProblems(page = 1, limit = 20, search = '', difficulty = '') {
    // Build a unique cache key incorporating all query params
    const cacheKey = `problems:page=${page}:limit=${limit}:search=${search}:difficulty=${difficulty}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await problemRepository.findPaginated(page, limit, search, difficulty);
    
    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 600);
    
    return result;
  }

  async getProblemBySlug(slug) {
    const cacheKey = `problem:${slug}`;
    
    const cachedProblem = await redis.get(cacheKey);
    if (cachedProblem) {
      return JSON.parse(cachedProblem);
    }

    const problem = await problemRepository.findBySlug(slug);
    if (!problem) {
      throw new Error('Problem not found');
    }

    await redis.set(cacheKey, JSON.stringify(problem), 'EX', 3600);
    
    return problem;
  }
}

module.exports = new ProblemService();
