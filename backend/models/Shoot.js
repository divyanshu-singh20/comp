const mongoose = require('mongoose');

const shootSchema = new mongoose.Schema(
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
    scriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Script',
      required: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    assignedCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
      index: true
    },
    cameraman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shootManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Reshoot Required'],
      default: 'Scheduled'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shoot', shootSchema);