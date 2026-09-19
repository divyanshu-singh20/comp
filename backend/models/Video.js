const mongoose = require('mongoose');

const videoPipelineStatuses = [
  'Script Approved',
  'Shoot Pending',
  'Raw Footage Received',
  'Video Editing',
  'Internal QA',
  'Client Review',
  'Revision',
  'Final Approved',
  'Delivered'
];

const videoSchema = new mongoose.Schema(
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
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator'
    },
    shootId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shoot'
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date,
      index: true
    },
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
      enum: videoPipelineStatuses,
      default: 'Script Approved',
      index: true
    }
  },
  { timestamps: true }
);

videoSchema.index({ orderId: 1, scriptId: 1 }, { unique: true });

module.exports = mongoose.model('Video', videoSchema);

module.exports.pipelineStatuses = videoPipelineStatuses;