const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    contactName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Lead', 'New', 'Onboarding', 'Active', 'On Hold', 'Completed', 'Inactive'],
      default: 'Lead'
    }
  },
  { timestamps: true }
);

clientSchema.index({ email: 1 });
clientSchema.index({ assignedEmployee: 1, status: 1 });

module.exports = mongoose.model('Client', clientSchema);
