const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { awardPurchaseCoins } = require('../utils/coinSystem'); // Reusing coin logic, might need custom function

// @route   GET /api/game/guess-price/product
// @desc    Get a random product for the game
// @access  Public (or Private)
router.get('/product', async (req, res) => {
    try {
        // Get distinct IDs first to pick a random one efficiently? 
        // Or just use $sample aggregation
        const randomProduct = await Product.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: 1 } },
            { $project: { name: 1, images: 1, description: 1 } } // Don't send price!
        ]);

        if (!randomProduct.length) {
            return res.status(404).json({ message: 'No products available' });
        }

        res.json(randomProduct[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/game/guess-price/submit
// @desc    Submit a guess
// @access  Private
router.post('/submit', auth, async (req, res) => {
    const { productId, guessedPrice } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const actualPrice = product.basePrice;
        const difference = Math.abs(actualPrice - guessedPrice);
        const threshold = actualPrice * 0.10; // Within 10%

        let won = false;
        let coinsWon = 0;

        if (difference <= threshold) {
            won = true;
            coinsWon = 10; // Fixed reward for now

            // Update User Coins directly
            await require('../models/User').findByIdAndUpdate(req.user.id, {
                $inc: { coins: coinsWon }
            });
        }

        res.json({
            won,
            actualPrice,
            guessedPrice,
            coinsWon,
            message: won ? `Great guess! You won ${coinsWon} coins.` : `Close! The price was $${actualPrice}.`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/game/guess-price/leaderboard
// @desc    Get top 10 users by coins
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await require('../models/User')
            .find({ role: { $ne: 'admin' } }) // Strictly exclude 'admin', just in case
            .sort({ coins: -1 })
            .limit(10)
            .select('name coins');

        res.json(topUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
