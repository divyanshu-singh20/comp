const express = require('express');
const {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient
} = require('../controllers/clientController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const clientManagers = checkRole(['Owner', 'Admin']);

router.use(verifyToken, clientManagers);
router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
