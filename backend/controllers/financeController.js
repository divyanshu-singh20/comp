const mongoose = require('mongoose');
const CreatorPayout = require('../models/CreatorPayout');
const Expense = require('../models/Expense');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Shoot = require('../models/Shoot');
const Video = require('../models/Video');
const { calculatePayoutTotal } = require('../services/payoutService');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const paymentStatuses = ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'];

const getPaymentStatus = (received, invoiceAmount, dueDate) => {
  if (received >= invoiceAmount) return 'Paid';
  if (dueDate && new Date(dueDate) < new Date()) return 'Overdue';
  if (received > 0) return 'Partially Paid';
  return 'Unpaid';
};

// Reconcile every payment row and its order after any ledger mutation.
const syncOrderPayments = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  const payments = await Payment.find({ orderId }).sort({ paymentDate: 1 });
  const received = payments.reduce((total, payment) => total + payment.amountReceived, 0);
  const invoiceAmount = order.totalAmount;
  const status = getPaymentStatus(received, invoiceAmount, order.dueDate);

  await Payment.updateMany(
    { orderId },
    {
      $set: {
        invoiceAmount,
        pendingBalance: Math.max(invoiceAmount - received, 0),
        status,
        dueDate: order.dueDate
      }
    }
  );

  order.amountReceived = received;
  order.balance = Math.max(invoiceAmount - received, 0);
  await order.save();
  return status;
};

const populatePayment = (query) => query
  .populate('clientId', 'companyName contactName email')
  .populate('orderId', 'packageName totalAmount amountReceived balance dueDate');

const createPayment = async (request, response) => {
  try {
    const order = await Order.findById(request.body.orderId);
    if (!order) return response.status(404).json({ message: 'Order not found' });
    if (String(order.clientId) !== String(request.body.clientId)) {
      return response.status(400).json({ message: 'Payment client does not match the order client' });
    }

    await syncOrderPayments(order._id);
    const refreshedOrder = await Order.findById(order._id);
    const amountReceived = Number(request.body.amountReceived);
    if (!Number.isFinite(amountReceived) || amountReceived <= 0) {
      return response.status(400).json({ message: 'amountReceived must be greater than zero' });
    }
    if (amountReceived > refreshedOrder.balance) {
      return response.status(400).json({ message: 'Payment cannot exceed the pending order balance' });
    }

    const payment = await Payment.create({
      ...request.body,
      invoiceAmount: order.totalAmount,
      dueDate: order.dueDate
    });
    await syncOrderPayments(order._id);
    return response.status(201).json(await populatePayment(Payment.findById(payment._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create payment', error: error.message });
  }
};

const getPayments = async (request, response) => {
  try {
    const filter = {};
    if (request.query.clientId) filter.clientId = request.query.clientId;
    if (request.query.orderId) filter.orderId = request.query.orderId;
    if (request.query.status && paymentStatuses.includes(request.query.status)) filter.status = request.query.status;
    return response.json(await populatePayment(Payment.find(filter).sort({ paymentDate: -1 })));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch payments', error: error.message });
  }
};

const updatePayment = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid payment id' });
    const payment = await Payment.findById(request.params.id);
    if (!payment) return response.status(404).json({ message: 'Payment not found' });
    ['clientId', 'orderId', 'invoiceAmount', 'pendingBalance', 'status'].forEach((field) => delete request.body[field]);
    Object.assign(payment, request.body);
    await payment.save();
    await syncOrderPayments(payment.orderId);
    return response.json(await populatePayment(Payment.findById(payment._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update payment', error: error.message });
  }
};

const deletePayment = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid payment id' });
    const payment = await Payment.findByIdAndDelete(request.params.id);
    if (!payment) return response.status(404).json({ message: 'Payment not found' });
    await syncOrderPayments(payment.orderId);
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete payment', error: error.message });
  }
};

const createExpense = async (request, response) => {
  try {
    const expense = await Expense.create({ ...request.body, createdBy: request.user._id });
    return response.status(201).json(expense);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create expense', error: error.message });
  }
};

const getExpenses = async (request, response) => {
  try {
    const filter = {};
    if (request.query.category) filter.category = request.query.category;
    if (request.query.from || request.query.to) filter.date = {};
    if (request.query.from) filter.date.$gte = new Date(request.query.from);
    if (request.query.to) filter.date.$lte = new Date(request.query.to);
    return response.json(await Expense.find(filter).populate('createdBy', 'name email').sort({ date: -1 }));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch expenses', error: error.message });
  }
};

const updateExpense = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid expense id' });
    const expense = await Expense.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');
    if (!expense) return response.status(404).json({ message: 'Expense not found' });
    return response.json(expense);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update expense', error: error.message });
  }
};

const deleteExpense = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid expense id' });
    const expense = await Expense.findByIdAndDelete(request.params.id);
    if (!expense) return response.status(404).json({ message: 'Expense not found' });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete expense', error: error.message });
  }
};

const createPayout = async (request, response) => {
  try {
    const duplicateFilter = request.body.videoId
      ? { videoId: request.body.videoId }
      : { shootId: request.body.shootId };
    if (await CreatorPayout.exists(duplicateFilter)) {
      return response.status(409).json({ message: 'A payout already exists for this shoot or video' });
    }
    if (request.body.shootId) {
      const shoot = await Shoot.findById(request.body.shootId);
      if (!shoot || shoot.status !== 'Completed') return response.status(409).json({ message: 'Payout requires a completed shoot' });
    }
    if (request.body.videoId) {
      const video = await Video.findById(request.body.videoId);
      if (!video || video.status !== 'Delivered') return response.status(409).json({ message: 'Payout requires a delivered video' });
    }
      if (!request.body.shootId && !request.body.videoId) {
        return response.status(400).json({ message: 'A shootId or videoId is required for a payout' });
      }

      const payout = await CreatorPayout.create({
        ...request.body,
        totalPayout: calculatePayoutTotal(request.body)
      });
    return response.status(201).json(await CreatorPayout.findById(payout._id).populate('creatorId', 'name').populate('orderId', 'packageName'));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create creator payout', error: error.message });
  }
};

const getPayouts = async (request, response) => {
  try {
    const filter = request.query.status ? { status: request.query.status } : {};
    return response.json(await CreatorPayout.find(filter)
      .populate('creatorId', 'name')
      .populate('orderId', 'packageName')
      .populate('shootId', 'date status')
      .populate('videoId', 'title status')
      .sort({ createdAt: -1 }));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch creator payouts', error: error.message });
  }
};

const updatePayout = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid payout id' });
    const payout = await CreatorPayout.findById(request.params.id);
    if (!payout) return response.status(404).json({ message: 'Creator payout not found' });
    ['creatorId', 'orderId', 'shootId', 'videoId', 'videoCount', 'contractedRate', 'totalPayout'].forEach((field) => delete request.body[field]);
    Object.assign(payout, request.body);
    if (payout.status === 'Paid') payout.paidAt = payout.paidAt || new Date();
    await payout.save();
    return response.json(payout);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update creator payout', error: error.message });
  }
};

const getFinancialSummary = async (request, response) => {
  try {
    const dateFilter = {};
    if (request.query.from || request.query.to) dateFilter.createdAt = {};
    if (request.query.from) dateFilter.createdAt.$gte = new Date(request.query.from);
    if (request.query.to) dateFilter.createdAt.$lte = new Date(request.query.to);
    const [revenue, expenses, payouts] = await Promise.all([
      Payment.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amountReceived' } } }]),
      Expense.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      CreatorPayout.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$totalPayout' } } }])
    ]);
    const revenueTotal = revenue[0]?.total || 0;
    const expenseTotal = expenses[0]?.total || 0;
    const payoutTotal = payouts[0]?.total || 0;
    return response.json({
      revenue: revenueTotal,
      expenses: expenseTotal,
      creatorPayouts: payoutTotal,
      netProfit: revenueTotal - expenseTotal - payoutTotal
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to calculate financial summary', error: error.message });
  }
};

module.exports = {
  createPayment, getPayments, updatePayment, deletePayment,
  createExpense, getExpenses, updateExpense, deleteExpense,
  createPayout, getPayouts, updatePayout, getFinancialSummary,
  syncOrderPayments
};