const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.get('/', foodController.getRestaurants);
router.get('/:id', foodController.getRestaurantById);

module.exports = router;
