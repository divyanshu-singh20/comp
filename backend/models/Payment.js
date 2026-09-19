const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true
    },
    invoiceAmount: {
      type: Number,
      required: true,
      min: 0
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Cash', 'Card', 'Cheque', 'Other'],
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Unpaid',
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);