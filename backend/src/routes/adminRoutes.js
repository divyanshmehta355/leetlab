const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Simple admin secret middleware
const adminAuth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret === (process.env.ADMIN_SECRET || 'leetlab-admin-secret')) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use(adminAuth);

router.get('/problems', adminController.getProblems);
router.get('/problems/:id', adminController.getProblem);
router.post('/problems', adminController.createProblem);
router.put('/problems/:id', adminController.updateProblem);
router.delete('/problems/:id', adminController.deleteProblem);
router.post('/problems/:id/testcases', adminController.addTestCase);

module.exports = router;
