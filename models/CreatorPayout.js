const mongoose = require('mongoose');

const creatorPayoutSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    shootId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shoot'
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    videoCount: {
      type: Number,
      required: true,
      min: 1
    },
    contractedRate: {
      type: Number,
      required: true,
      min: 0
    },
    totalPayout: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid'],
      default: 'Pending',
      index: true
    },
    paidAt: Date
  },
  { timestamps: true }
);

creatorPayoutSchema.index({ shootId: 1 }, { unique: true, sparse: true });
creatorPayoutSchema.index({ videoId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('CreatorPayout', creatorPayoutSchema);