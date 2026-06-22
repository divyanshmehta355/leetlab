const { Queue } = require('bullmq');
const redisConfig = require('../config/redis');

// BullMQ uses ioredis connection directly
const submissionQueue = new Queue('submissions', {
  connection: redisConfig
});

module.exports = submissionQueue;
