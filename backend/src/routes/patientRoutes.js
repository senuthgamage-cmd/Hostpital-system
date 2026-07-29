const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// All patient routes require authentication
router.use(authMiddleware);

// Route to register a patient
router.post('/', patientController.registerPatient);

// Route to list/search patients
router.get('/', patientController.getPatients);

module.exports = router;
