const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by bullmq
  tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

module.exports = redis;
