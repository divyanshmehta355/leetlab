const problemRepository = require('../repositories/problemRepository');
const redis = require('../config/redis');

class ProblemService {
  async getAllProblems() {
    const cacheKey = 'problems:all';
    
    // Try to get from cache
    const cachedProblems = await redis.get(cacheKey);
    if (cachedProblems) {
      return JSON.parse(cachedProblems);
    }

    // Fetch from DB
    const problems = await problemRepository.findAll();
    
    // Store in cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(problems), 'EX', 3600);
    
    return problems;
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
