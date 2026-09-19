const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema(
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
    videoNumber: {
      type: Number,
      required: true,
      min: 1
    },
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator'
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    scriptText: {
      type: String,
      default: ''
    },
    referenceLinks: {
      type: [String],
      default: []
    },
    deadline: Date,
    revisionCount: {
      type: Number,
      default: 0,
      min: 0
    },
    feedbackLog: [{
      comment: {
        type: String,
        required: true,
        trim: true
      },
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      source: {
        type: String,
        enum: ['Client', 'Internal'],
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['Draft', 'Assigned', 'In Review', 'Revision Required', 'Ready for Shoot', 'Approved', 'Sent to Client'],
      default: 'Draft'
    }
  },
  { timestamps: true }
);

scriptSchema.index({ orderId: 1, videoNumber: 1 }, { unique: true });

module.exports = mongoose.model('Script', scriptSchema);
