const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Salaries', 'Office', 'Studio', 'Equipment', 'Fuel', 'Payouts'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    receiptFile: {
      filename: String,
      url: String,
      mimeType: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);