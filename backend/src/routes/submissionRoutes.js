const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect submission routes
router.use(authMiddleware);

router.post('/', submissionController.submitCode);
router.get('/:id', submissionController.getSubmissionStatus);

module.exports = router;
