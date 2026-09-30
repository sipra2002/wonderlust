const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use(requireAuth, requireRole(['ADMIN', 'SUPPORT_AGENT']));

router.get('/analytics', adminController.getAnalytics);
router.get('/hotels/pending', adminController.getPendingHotels);
router.get('/hotels', adminController.getAllHotels);
router.patch('/hotels/:id/approval', adminController.updateHotelApproval);
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/vendors/:id/verification', adminController.toggleVendorVerification);
router.get('/tickets', adminController.getAllTickets);
router.patch('/tickets/:id/status', adminController.updateTicketStatus);

module.exports = router;
