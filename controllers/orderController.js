const mongoose = require('mongoose');
const Order = require('../models/Order');
const Video = require('../models/Video');
const { calculateOrderAmounts } = require('../services/orderService');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Derive live delivery progress from scripts instead of storing a counter that can drift.
const getProductionCounter = async (order) => {
  const deliveredVideos = await Video.countDocuments({
    orderId: order._id,
    status: 'Delivered'
  });
  const orderedVideos = order.contractedVideos;
  const remainingVideos = Math.max(orderedVideos - deliveredVideos, 0);
  const deliveryPercentage = orderedVideos === 0
    ? 0
    : Math.min(Math.round((deliveredVideos / orderedVideos) * 100), 100);

  return {
    orderedVideos,
    deliveredVideos,
    remainingVideos,
    deliveryPercentage
  };
};

const withProductionCounter = async (order) => ({
  ...order.toObject(),
  production: await getProductionCounter(order)
});

const createOrder = async (request, response) => {
  try {
    const amounts = calculateOrderAmounts(request.body);
    const order = await Order.create({ ...request.body, ...amounts });
    const populatedOrder = await Order.findById(order._id)
      .populate('clientId', 'companyName contactName email')
      .populate('assignedTeam', 'name email role');

    return response.status(201).json(await withProductionCounter(populatedOrder));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create order', error: error.message });
  }
};

// Return every order with its current delivered and remaining quota.
const getOrders = async (request, response) => {
  try {
    const orders = await Order.find()
      .populate('clientId', 'companyName contactName email')
      .populate('assignedTeam', 'name email role')
      .sort({ createdAt: -1 });
    const ordersWithCounters = await Promise.all(orders.map(withProductionCounter));

    return response.json(ordersWithCounters);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch orders', error: error.message });
  }
};

const getOrder = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(request.params.id)
      .populate('clientId', 'companyName contactName email')
      .populate('assignedTeam', 'name email role');

    if (!order) {
      return response.status(404).json({ message: 'Order not found' });
    }

    return response.json(await withProductionCounter(order));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch order', error: error.message });
  }
};

const updateOrder = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(request.params.id);
    if (!order) {
      return response.status(404).json({ message: 'Order not found' });
    }

    const updates = { ...request.body };
    Object.assign(order, updates, calculateOrderAmounts({
      pricing: updates.pricing ?? order.pricing,
      gst: updates.gst ?? order.gst,
      amountReceived: updates.amountReceived ?? order.amountReceived
    }));
    await order.save();
    await order.populate('clientId', 'companyName contactName email');
    await order.populate('assignedTeam', 'name email role');

    return response.json(await withProductionCounter(order));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update order', error: error.message });
  }
};

const deleteOrder = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findByIdAndDelete(request.params.id);
    if (!order) {
      return response.status(404).json({ message: 'Order not found' });
    }

    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder
};
