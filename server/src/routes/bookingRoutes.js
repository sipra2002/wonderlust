const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { initiateBookingSchema, verifyPaymentSchema } = require('../validators');

router.post('/initiate', requireAuth, validate(initiateBookingSchema), bookingController.initiateBooking);
router.post('/verify', requireAuth, validate(verifyPaymentSchema), bookingController.verifyPayment);
router.get('/my-bookings', requireAuth, bookingController.getMyBookings);
router.get('/:id', requireAuth, bookingController.getBookingById);
router.post('/:id/cancel', requireAuth, bookingController.cancelBooking);

module.exports = router;
