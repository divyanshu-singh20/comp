const express = require('express');
const {
  createExpense,
  createPayment,
  createPayout,
  deleteExpense,
  deletePayment,
  getExpenses,
  getFinancialSummary,
  getPayouts,
  getPayments,
  updateExpense,
  updatePayment,
  updatePayout
} = require('../controllers/financeController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const financeAdmin = checkRole(['Owner', 'Admin']);

router.use(verifyToken, financeAdmin);
router.get('/summary', getFinancialSummary);
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.patch('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.patch('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);
router.get('/payouts', getPayouts);
router.post('/payouts', createPayout);
router.patch('/payouts/:id', updatePayout);

module.exports = router;