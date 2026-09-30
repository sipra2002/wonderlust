const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { requireAuth } = require('../middlewares/auth');

router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/:id/reviews', requireAuth, hotelController.addHotelReview);

module.exports = router;
