const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Address = require('../models/Address');
const auth = require('../middleware/auth');
const { awardPurchaseCoins } = require('../utils/coinSystem');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddressId, paymentMethod, subtotal, shippingCost, discount, orderNotes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!deliveryAddressId) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const address = await Address.findOne({
      _id: deliveryAddressId,
      userId: req.user.id
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const totalAmount = subtotal + (shippingCost || 0) - (discount || 0);

    const order = new Order({
      userId: req.user.id,
      items,
      deliveryAddress: deliveryAddressId,
      paymentMethod,
      subtotal,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      totalAmount,
      orderNotes: orderNotes || '',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'processing'
    });

    const savedOrder = await order.save();

    // Award coins for purchase (award immediately for COD, or when payment is confirmed)
    if (order.paymentMethod === 'cod') {
      await awardPurchaseCoins(req.user.id, order.totalAmount, savedOrder._id);
    }

    await savedOrder.populate('deliveryAddress');

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('deliveryAddress')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('deliveryAddress');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (for admin use - you can add admin middleware)
// @access  Private
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/orders/:id/payment-status
// @desc    Update payment status (called by payment webhooks)
// @access  Private
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus, transactionId, orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousPaymentStatus = order.paymentStatus;

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (transactionId) {
      order.transactionId = transactionId;
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    await order.save();

    // Award coins when payment is confirmed (for Stripe/Razorpay)
    if (previousPaymentStatus !== 'paid' && paymentStatus === 'paid') {
      await awardPurchaseCoins(order.userId, order.totalAmount, order._id);
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order (only if status is 'processing')
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'processing') {
      return res.status(400).json({ message: 'Cannot cancel order that is already confirmed or shipped' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get ALL orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', auth, require('../middleware/admin'), async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .populate('deliveryAddress')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/orders/admin/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.patch('/admin/:id/status', auth, require('../middleware/admin'), async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = orderStatus;
    await order.save();

    // Check if status changed to delivered or paid handling if needed

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;