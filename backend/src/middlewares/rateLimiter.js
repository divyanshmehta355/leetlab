const rateLimit = require('express-rate-limit');

// Global rate limiter — applies to every request
// 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

// Auth rate limiter — strict limit on login/register to prevent brute-force
// 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Submission rate limiter — protects your JDoodle API quota
// 10 code submissions per 5 minutes per IP
const submissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are submitting code too frequently. Please wait a few minutes.' }
});

module.exports = { globalLimiter, authLimiter, submissionLimiter };
