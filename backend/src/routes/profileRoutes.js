const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

// GET /api/profiles/:username
router.get('/:username', userProfileController.getProfile);

module.exports = router;
