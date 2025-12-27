const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent', 'referral_bonus', 'purchase_reward'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);