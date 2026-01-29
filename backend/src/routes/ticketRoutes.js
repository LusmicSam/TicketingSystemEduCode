const express = require('express');
const { createTicket, getTickets, getTicketHistory, resolveTicket, submitFeedback } = require('../controllers/ticketController');
const { protectAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', createTicket);
router.get('/', protectAdmin, getTickets);
router.get('/history', getTicketHistory);
router.patch('/:id/transfer/initiate', protectAdmin, require('../controllers/ticketController').initiateTransfer);
router.patch('/:id/transfer/accept', protectAdmin, require('../controllers/ticketController').acceptTransfer);
router.patch('/:id/transfer/reject', protectAdmin, require('../controllers/ticketController').rejectTransfer);
router.patch('/:id/resolve', protectAdmin, resolveTicket);
router.patch('/:id/lock', protectAdmin, require('../controllers/ticketController').lockTicket);
router.patch('/:id/feedback', submitFeedback);

module.exports = router;
