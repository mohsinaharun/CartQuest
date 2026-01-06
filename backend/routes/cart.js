const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name images');

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Calculate total manually just to be safe before sending
        // (Actual calculation handles in frontend usually, or persisted on save)

        const totalAmount = cart.calculateTotal();
        const response = cart.toObject();
        response.totalAmount = totalAmount;

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, async (req, res) => {
    const { productId, variant, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Determind price (base or variant)
        let price = product.basePrice;
        if (variant && variant.size && variant.color) {
            const foundVariant = product.variants.find(v =>
                v.size === variant.size && v.color === variant.color
            );
            if (foundVariant && foundVariant.price) {
                price = foundVariant.price;
            }
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Check if product+variant already exists in cart
        const itemIndex = cart.items.findIndex(p => {
            const sameProduct = p.product.toString() === productId;
            // Simple variant comparison
            const sameVariant = (!p.variant && !variant) ||
                (p.variant && variant && p.variant.size === variant.size && p.variant.color === variant.color);
            return sameProduct && sameVariant;
        });

        if (itemIndex > -1) {
            // Product exists, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Product does not exist, push new item
            cart.items.push({
                product: productId,
                variant,
                quantity,
                price
            });
        }

        cart.lastUpdated = Date.now();
        await cart.save();

        // Populate for response
        await cart.populate('items.product', 'name images');

        const totalAmount = cart.calculateTotal();
        const response = cart.toObject();
        response.totalAmount = totalAmount;

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity
// @access  Private
router.put('/update', auth, async (req, res) => {
    const { itemId, quantity } = req.body; // itemId is the _id of the item inside the array

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                // Remove if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            await cart.populate('items.product', 'name images');

            const totalAmount = cart.calculateTotal();
            const response = cart.toObject();
            response.totalAmount = totalAmount;

            return res.json(response);
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId', auth, async (req, res) => {
    try {
        console.log(`[DEBUG] Removing item ${req.params.itemId} for user ${req.user.id}`);
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            console.log(`[DEBUG] Cart not found for user ${req.user.id}`);
            return res.status(404).json({ message: 'Cart not found' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

        if (cart.items.length === initialLength) {
            console.log(`[DEBUG] Item ${req.params.itemId} not found in cart`);
            // We can return 404 here if we want to be strict, or just 200 (idempotent)
            // But the user got a 404, implying something else might be wrong.
            // Let's explicitly return 404 here to see if this is the case.
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();
        await cart.populate('items.product', 'name images');

        const totalAmount = cart.calculateTotal();
        const response = cart.toObject();
        response.totalAmount = totalAmount;

        console.log(`[DEBUG] Item removed successfully`);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/cart/coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/coupon', auth, async (req, res) => {
    const { code } = req.body;
    try {
        const user = await require('../models/User').findById(req.user.id);
        const validCoupon = user.coupons.find(c => c.code === code);

        if (!validCoupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.appliedCoupon = {
            code: validCoupon.code,
            discount: validCoupon.discount
        };

        await cart.save();
        await cart.populate('items.product', 'name images');

        const totalAmount = cart.calculateTotal();
        const response = cart.toObject();
        response.totalAmount = totalAmount;

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/cart/coupon
// @desc    Remove coupon
router.delete('/coupon', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.appliedCoupon = undefined;
        await cart.save();
        await cart.populate('items.product', 'name images');

        const totalAmount = cart.calculateTotal();
        const response = cart.toObject();
        response.totalAmount = totalAmount;

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
