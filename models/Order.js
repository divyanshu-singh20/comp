const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    packageName: {
      type: String,
      required: true,
      trim: true
    },
    contractedVideos: {
      type: Number,
      required: true,
      min: 0
    },
    pricing: {
      type: Number,
      required: true,
      min: 0
    },
    gst: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveredVideos: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingVideos: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: Date,
    dueDate: Date,
    assignedTeam: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['New', 'Onboarding', 'In Production', 'Partially Delivered', 'Completed', 'On Hold', 'Cancelled'],
      default: 'New'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
