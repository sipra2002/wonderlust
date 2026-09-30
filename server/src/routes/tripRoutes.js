const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { requireAuth, optionalAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createTripSchema, createItineraryItemSchema } = require('../validators');

router.get('/', requireAuth, tripController.getMyTrips);
router.post('/', requireAuth, validate(createTripSchema), tripController.createTrip);
router.get('/:id', optionalAuth, tripController.getTripById);
router.post('/:id/items', requireAuth, validate(createItineraryItemSchema), tripController.addItineraryItem);
router.delete('/:id/items/:itemId', requireAuth, tripController.deleteItineraryItem);
router.patch('/:id/visibility', requireAuth, tripController.toggleTripVisibility);

module.exports = router;
