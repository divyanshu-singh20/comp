const express = require('express');
const {
  createShoot,
  deleteShoot,
  getShoot,
  getShoots,
  updateShoot
} = require('../controllers/shootController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const canManageShoots = checkRole(['Owner', 'Admin', 'ShootManager']);

router.use(verifyToken, canManageShoots);
router.get('/', getShoots);
router.get('/:id', getShoot);
router.post('/', createShoot);
router.patch('/:id', updateShoot);
router.delete('/:id', checkRole(['Owner', 'Admin']), deleteShoot);

module.exports = router;
