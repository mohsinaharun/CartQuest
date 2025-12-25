const express = require('express');
const router = express.Router();
const CoinTransaction = require('../models/CoinTransaction');
const auth = require('../middleware/auth');
const {
  getUserCoinBalance,
  spendCoins,
  calculateDiscount,
  COIN_CONFIG
} = require('../utils/coinSystem');

// @route   GET /api/coins/balance
// @desc    Get user's coin balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const balance = await getUserCoinBalance(req.user.id);
    
    res.json({
      balance,
      config: {
        coinsPerDollar: COIN_CONFIG.COINS_PER_DOLLAR,
        coinToDollarRatio: COIN_CONFIG.COIN_TO_DOLLAR_RATIO,
        minCoinsForRedemption: COIN_CONFIG.MIN_COINS_FOR_REDEMPTION
      }
    });
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coins/transactions
// @desc    Get user's coin transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await CoinTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'totalAmount orderStatus')
      .populate('referralId', 'referralCode');
    
    const count = await CoinTransaction.countDocuments({ userId: req.user.id });
    
    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTransactions: count
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coins/calculate-discount
// @desc    Calculate discount from coins (without spending)
// @access  Private
router.post('/calculate-discount', auth, async (req, res) => {
  try {
    const { coins } = req.body;
    
    if (!coins || coins < 0) {
      return res.status(400).json({ message: 'Invalid coin amount' });
    }
    
    const currentBalance = await getUserCoinBalance(req.user.id);
    
    if (coins > currentBalance) {
      return res.status(400).json({ message: 'Insufficient coin balance' });
    }
    
    const discount = calculateDiscount(coins);
    
    res.json({
      coins,
      discount,
      remainingBalance: currentBalance - coins,
      canRedeem: coins >= COIN_CONFIG.MIN_COINS_FOR_REDEMPTION
    });
  } catch (error) {
    console.error('Error calculating discount:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coins/spend
// @desc    Spend coins for discount
// @access  Private
router.post('/spend', auth, async (req, res) => {
  try {
    const { coins } = req.body;
    
    if (!coins || coins < 0) {
      return res.status(400).json({ message: 'Invalid coin amount' });
    }
    
    const result = await spendCoins(req.user.id, coins);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message || 'Failed to spend coins' });
    }
    
    res.json({
      success: true,
      coinsSpent: result.coinsSpent,
      discountAmount: result.discountAmount,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Error spending coins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coins/stats
// @desc    Get user's coin statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const balance = await getUserCoinBalance(req.user.id);
    
    const transactions = await CoinTransaction.find({ userId: req.user.id });
    
    const totalEarned = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const purchaseRewards = transactions
      .filter(t => t.type === 'purchase_reward')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const referralRewards = transactions
      .filter(t => t.type === 'referral_bonus')
      .reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      currentBalance: balance,
      totalEarned,
      totalSpent,
      purchaseRewards,
      referralRewards,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error('Error fetching coin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;