const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.use(authMiddleware);

router.get('/summary', reportController.summary);

module.exports = router;