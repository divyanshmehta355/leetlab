const express = require('express');
const router = express.Router();
const solutionController = require('../controllers/solutionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Optional auth middleware to extract userId if logged in, but not block if not
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {}
  next();
};

// GET solutions for a problem (public, but optionally aware of logged in user for upvote status)
router.get('/problems/:problemId/solutions', optionalAuth, solutionController.getSolutions);

// POST create a solution for a problem (protected)
router.post('/problems/:problemId/solutions', authMiddleware, solutionController.createSolution);

// POST toggle upvote on a solution (protected)
router.post('/solutions/:solutionId/upvote', authMiddleware, solutionController.toggleUpvote);

module.exports = router;
