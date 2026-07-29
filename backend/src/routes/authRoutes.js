const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for user login
router.post('/login', authController.login);

// Route for registering new staff (can be used for adding staff members)
router.post('/register', authController.register);

// Route for password management
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
