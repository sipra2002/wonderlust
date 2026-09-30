const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { requireAuth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createTicketSchema } = require('../validators');

router.get('/', requireAuth, ticketController.getMyTickets);
router.post('/', requireAuth, validate(createTicketSchema), ticketController.createTicket);
router.get('/:id', requireAuth, ticketController.getTicketById);
router.post('/:id/messages', requireAuth, ticketController.addTicketMessage);

module.exports = router;
