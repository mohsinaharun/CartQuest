const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Stripe payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and order ID are required' });
    }
    
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        orderId: orderId,
        userId: req.user.id.toString()
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
});

// Stripe webhook
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        transactionId: paymentIntent.id
      });
      
      console.log(`Payment succeeded for order: ${orderId}`);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedOrderId = failedPayment.metadata.orderId;
      
      await Order.findByIdAndUpdate(failedOrderId, {
        paymentStatus: 'failed'
      });
      
      console.log(`Payment failed for order: ${failedOrderId}`);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Create Razorpay order
router.post('/create-razorpay-order', auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and order ID are required' });
    }
    
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: orderId,
      notes: {
        orderId: orderId,
        userId: req.user.id.toString()
      }
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// Verify Razorpay payment
router.post('/verify-razorpay-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }
    
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generated_signature === razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        transactionId: razorpay_payment_id
      });
      
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        orderId 
      });
    } else {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
      
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Razorpay webhook
router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
    
    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    
    if (event === 'payment.captured') {
      const orderId = payload.notes.orderId;
      
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        transactionId: payload.id
      });
      
      console.log(`Razorpay payment captured for order: ${orderId}`);
    } else if (event === 'payment.failed') {
      const orderId = payload.notes.orderId;
      
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
      
      console.log(`Razorpay payment failed for order: ${orderId}`);
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;