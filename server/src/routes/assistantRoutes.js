const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');

router.get('/faq', assistantController.getFaqs);
router.get('/emergency', assistantController.getEmergencyContacts);

module.exports = router;
