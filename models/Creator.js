const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    demographics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    languages: {
      type: [String],
      default: []
    },
    niches: {
      type: [String],
      default: []
    },
    rates: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    bankDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Booked', 'Unavailable', 'On Hold'],
      default: 'Available'
    }
  },
  { timestamps: true }
);

creatorSchema.index({ availabilityStatus: 1 });

module.exports = mongoose.model('Creator', creatorSchema);