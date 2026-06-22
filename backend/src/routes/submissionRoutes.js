const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { submissionLimiter } = require('../middlewares/rateLimiter');

// Protect submission routes
router.use(authMiddleware);

router.post('/', submissionLimiter, submissionController.submitCode);
router.get('/:id', submissionController.getSubmissionStatus);

module.exports = router;
