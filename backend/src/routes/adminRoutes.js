const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.use(isAdmin);

router.get('/problems', adminController.getProblems);
router.get('/problems/:id', adminController.getProblem);
router.post('/problems', adminController.createProblem);
router.put('/problems/:id', adminController.updateProblem);
router.delete('/problems/:id', adminController.deleteProblem);
router.post('/problems/:id/testcases', adminController.addTestCase);

module.exports = router;
