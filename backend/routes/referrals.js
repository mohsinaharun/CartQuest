const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const auth = require('../middleware/auth');
const {
  generateUserReferralCode,
  awardReferralBonus,
  COIN_CONFIG
} = require('../utils/coinSystem');

// @route   GET /api/referrals/my-code
// @desc    Get user's referral code (or generate if doesn't exist)
// @access  Private
router.get('/my-code', auth, async (req, res) => {
  try {
    const result = await generateUserReferralCode(req.user.id);
    
    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Failed to generate referral code' });
    }
    
    res.json({
      referralCode: result.referralCode,
      referralBonus: COIN_CONFIG.REFERRAL_BONUS_REFERRER,
      newUserBonus: COIN_CONFIG.REFERRAL_BONUS_REFERRED
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/referrals/apply
// @desc    Apply referral code (for new users during registration)
// @access  Private
router.post('/apply', auth, async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }
    
    // Check if user already used a referral code
    const existingReferral = await Referral.findOne({
      referredUserId: req.user.id,
      status: 'completed'
    });
    
    if (existingReferral) {
      return res.status(400).json({ message: 'You have already used a referral code' });
    }
    
    // Check if user is trying to use their own code
    const ownReferral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
      referrerId: req.user.id
    });
    
    if (ownReferral) {
      return res.status(400).json({ message: 'You cannot use your own referral code' });
    }
    
    const result = await awardReferralBonus(referralCode.toUpperCase(), req.user.id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message || 'Invalid referral code' });
    }
    
    res.json({
      success: true,
      message: `You received ${result.newUserCoins} Mahi Coins!`,
      coinsEarned: result.newUserCoins
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/referrals/my-referrals
// @desc    Get list of user's successful referrals
// @access  Private
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const referrals = await Referral.find({
      referrerId: req.user.id,
      status: 'completed'
    })
      .populate('referredUserId', 'name email')
      .sort({ completedAt: -1 });
    
    const totalCoinsEarned = referrals.reduce((sum, ref) => sum + COIN_CONFIG.REFERRAL_BONUS_REFERRER, 0);
    
    res.json({
      referrals,
      totalReferrals: referrals.length,
      totalCoinsEarned
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/referrals/stats
// @desc    Get user's referral statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const completedReferrals = await Referral.countDocuments({
      referrerId: req.user.id,
      status: 'completed'
    });
    
    const pendingReferrals = await Referral.countDocuments({
      referrerId: req.user.id,
      status: 'pending'
    });
    
    const totalCoinsEarned = completedReferrals * COIN_CONFIG.REFERRAL_BONUS_REFERRER;
    
    res.json({
      completedReferrals,
      pendingReferrals,
      totalCoinsEarned,
      coinsPerReferral: COIN_CONFIG.REFERRAL_BONUS_REFERRER
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/referrals/validate
// @desc    Validate a referral code without applying it
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }
    
    const referral = await Referral.findOne({
      referralCode: referralCode.toUpperCase(),
      status: 'pending'
    });
    
    if (!referral) {
      return res.json({
        valid: false,
        message: 'Invalid or already used referral code'
      });
    }
    
    res.json({
      valid: true,
      bonus: COIN_CONFIG.REFERRAL_BONUS_REFERRED,
      message: `You'll receive ${COIN_CONFIG.REFERRAL_BONUS_REFERRED} Mahi Coins!`
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;