const CoinTransaction = require('../models/CoinTransaction');
const Referral = require('../models/Referral');

// Configuration
const COIN_CONFIG = {
  COINS_PER_DOLLAR: 10, // 10 coins per $1 spent
  REFERRAL_BONUS_REFERRER: 100, // Coins for referrer when someone uses their code
  REFERRAL_BONUS_REFERRED: 50, // Coins for new user using referral code
  COIN_TO_DOLLAR_RATIO: 100, // 100 coins = $1 discount
  MIN_COINS_FOR_REDEMPTION: 50 // Minimum coins needed to redeem
};

// Get user's current coin balance
async function getUserCoinBalance(userId) {
  try {
    const transactions = await CoinTransaction.find({ userId }).sort({ createdAt: -1 }).limit(1);
    
    if (transactions.length === 0) {
      return 0;
    }
    
    return transactions[0].balanceAfter;
  } catch (error) {
    console.error('Error getting coin balance:', error);
    return 0;
  }
}

// Award coins for purchase
async function awardPurchaseCoins(userId, orderAmount, orderId) {
  try {
    const coinsEarned = Math.floor(orderAmount * COIN_CONFIG.COINS_PER_DOLLAR);
    const currentBalance = await getUserCoinBalance(userId);
    const newBalance = currentBalance + coinsEarned;
    
    const transaction = new CoinTransaction({
      userId,
      amount: coinsEarned,
      type: 'purchase_reward',
      description: `Earned ${coinsEarned} coins from purchase`,
      orderId,
      balanceAfter: newBalance
    });
    
    await transaction.save();
    
    return {
      success: true,
      coinsEarned,
      newBalance
    };
  } catch (error) {
    console.error('Error awarding purchase coins:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Award referral bonus
async function awardReferralBonus(referralCode, newUserId) {
  try {
    const referral = await Referral.findOne({ referralCode, status: 'pending' });
    
    if (!referral) {
      return {
        success: false,
        message: 'Invalid or already used referral code'
      };
    }
    
    // Award coins to referrer
    const referrerBalance = await getUserCoinBalance(referral.referrerId);
    const referrerNewBalance = referrerBalance + COIN_CONFIG.REFERRAL_BONUS_REFERRER;
    
    const referrerTransaction = new CoinTransaction({
      userId: referral.referrerId,
      amount: COIN_CONFIG.REFERRAL_BONUS_REFERRER,
      type: 'referral_bonus',
      description: `Referral bonus for inviting a friend`,
      referralId: referral._id,
      balanceAfter: referrerNewBalance
    });
    
    await referrerTransaction.save();
    
    // Award coins to new user
    const newUserBalance = await getUserCoinBalance(newUserId);
    const newUserNewBalance = newUserBalance + COIN_CONFIG.REFERRAL_BONUS_REFERRED;
    
    const newUserTransaction = new CoinTransaction({
      userId: newUserId,
      amount: COIN_CONFIG.REFERRAL_BONUS_REFERRED,
      type: 'referral_bonus',
      description: `Welcome bonus for using referral code`,
      referralId: referral._id,
      balanceAfter: newUserNewBalance
    });
    
    await newUserTransaction.save();
    
    // Update referral status
    referral.referredUserId = newUserId;
    referral.status = 'completed';
    referral.coinsAwarded = COIN_CONFIG.REFERRAL_BONUS_REFERRER + COIN_CONFIG.REFERRAL_BONUS_REFERRED;
    referral.completedAt = new Date();
    await referral.save();
    
    return {
      success: true,
      referrerCoins: COIN_CONFIG.REFERRAL_BONUS_REFERRER,
      newUserCoins: COIN_CONFIG.REFERRAL_BONUS_REFERRED
    };
  } catch (error) {
    console.error('Error awarding referral bonus:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Spend coins for discount
async function spendCoins(userId, coinsToSpend) {
  try {
    const currentBalance = await getUserCoinBalance(userId);
    
    if (currentBalance < coinsToSpend) {
      return {
        success: false,
        message: 'Insufficient coin balance'
      };
    }
    
    if (coinsToSpend < COIN_CONFIG.MIN_COINS_FOR_REDEMPTION) {
      return {
        success: false,
        message: `Minimum ${COIN_CONFIG.MIN_COINS_FOR_REDEMPTION} coins required for redemption`
      };
    }
    
    const discountAmount = coinsToSpend / COIN_CONFIG.COIN_TO_DOLLAR_RATIO;
    const newBalance = currentBalance - coinsToSpend;
    
    const transaction = new CoinTransaction({
      userId,
      amount: -coinsToSpend,
      type: 'spent',
      description: `Redeemed ${coinsToSpend} coins for $${discountAmount.toFixed(2)} discount`,
      balanceAfter: newBalance
    });
    
    await transaction.save();
    
    return {
      success: true,
      coinsSpent: coinsToSpend,
      discountAmount,
      newBalance
    };
  } catch (error) {
    console.error('Error spending coins:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Calculate discount from coins
function calculateDiscount(coins) {
  if (coins < COIN_CONFIG.MIN_COINS_FOR_REDEMPTION) {
    return 0;
  }
  return coins / COIN_CONFIG.COIN_TO_DOLLAR_RATIO;
}

// Generate referral code for user
async function generateUserReferralCode(userId) {
  try {
    // Check if user already has a referral code
    const existingReferral = await Referral.findOne({ referrerId: userId, status: { $ne: 'expired' } });
    
    if (existingReferral) {
      return {
        success: true,
        referralCode: existingReferral.referralCode
      };
    }
    
    // Generate new referral code
    const referralCode = await Referral.generateReferralCode(userId);
    
    const referral = new Referral({
      referrerId: userId,
      referralCode
    });
    
    await referral.save();
    
    return {
      success: true,
      referralCode
    };
  } catch (error) {
    console.error('Error generating referral code:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  COIN_CONFIG,
  getUserCoinBalance,
  awardPurchaseCoins,
  awardReferralBonus,
  spendCoins,
  calculateDiscount,
  generateUserReferralCode
};