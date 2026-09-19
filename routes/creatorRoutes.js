const express = require('express');
const {
  createCreator,
  deleteCreator,
  getCreator,
  getCreators,
  updateCreator
} = require('../controllers/creatorController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const canManageCreators = checkRole(['Owner', 'Admin', 'ShootManager']);

router.use(verifyToken);
router.get('/', getCreators);
router.get('/:id', getCreator);
router.post('/', canManageCreators, createCreator);
router.patch('/:id', canManageCreators, updateCreator);
router.delete('/:id', checkRole(['Owner', 'Admin']), deleteCreator);

module.exports = router;
