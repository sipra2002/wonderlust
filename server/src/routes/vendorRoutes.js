const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use(requireAuth, requireRole(['VENDOR', 'ADMIN']));

router.get('/dashboard', vendorController.getVendorDashboard);
router.post('/hotels', vendorController.createHotel);

module.exports = router;
