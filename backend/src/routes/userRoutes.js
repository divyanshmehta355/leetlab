const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get current logged in user details
router.get('/me', authMiddleware, userController.getMe);

// Update user profile fields (bio, github, website)
router.put('/me/profile', authMiddleware, userController.updateProfile);

// Delete account permanently
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;
