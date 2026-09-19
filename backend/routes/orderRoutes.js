const express = require('express');
const {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder
} = require('../controllers/orderController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const canManageOrders = checkRole(['Owner', 'Admin', 'ShootManager']);
const canReadOrders = checkRole(['Owner', 'Admin', 'ShootManager', 'Editor']);

router.use(verifyToken);
router.get('/', canReadOrders, getOrders);
router.get('/:id', canReadOrders, getOrder);
router.post('/', canManageOrders, createOrder);
router.patch('/:id', canManageOrders, updateOrder);
router.delete('/:id', canManageOrders, deleteOrder);

module.exports = router;
