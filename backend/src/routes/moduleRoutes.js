const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const moduleController = require('../controllers/moduleController');

router.use(authMiddleware);

router.get('/:module', moduleController.listRecords);
router.post('/:module', moduleController.createRecord);
router.put('/:module/:id', moduleController.updateRecord);
router.delete('/:module/:id', moduleController.deleteRecord);

module.exports = router;