const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  coinsAwarded: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique referral code
referralSchema.statics.generateReferralCode = async function(userId) {
  const code = `MAHI${userId.toString().slice(-6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  // Check if code already exists
  const exists = await this.findOne({ referralCode: code });
  if (exists) {
    return this.generateReferralCode(userId); // Try again
  }
  
  return code;
};

// Index for faster lookups
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1, status: 1 });

module.exports = mongoose.model('Referral', referralSchema);