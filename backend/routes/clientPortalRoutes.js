const express = require('express');
const {
  createTicket,
  decideVideo,
  deleteTicket,
  getPortalOverview,
  getTicket,
  getTickets,
  updateTicket
} = require('../controllers/clientPortalController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.get('/overview', checkRole(['Client']), getPortalOverview);
router.post('/videos/:videoId/decision', checkRole(['Client']), decideVideo);
router.get('/tickets', checkRole(['Client', 'Owner', 'Admin']), getTickets);
router.post('/tickets', checkRole(['Client', 'Owner', 'Admin']), createTicket);
router.get('/tickets/:id', checkRole(['Client', 'Owner', 'Admin']), getTicket);
router.patch('/tickets/:id', checkRole(['Client', 'Owner', 'Admin']), updateTicket);
router.delete('/tickets/:id', checkRole(['Client', 'Owner', 'Admin']), deleteTicket);

module.exports = router;
