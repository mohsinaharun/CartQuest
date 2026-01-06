const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());

// IMPORTANT: Webhook routes BEFORE express.json()
app.use('/api/payment/stripe-webhook', express.raw({ type: 'application/json' }));
app.use('/api/payment/razorpay-webhook', express.raw({ type: 'application/json' }));

// Now add JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Import routes
const authRoutes = require('./routes/auth');
const wheelRoutes = require('./routes/wheel');
const addressRoutes = require('./routes/address');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');

// Use routes
// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/wheel", wheelRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// New Routes
app.use("/api/products", require('./routes/products'));
app.use("/api/cart", require('./routes/cart'));
app.use("/api/game/guess-price", require('./routes/guessPrice'));
app.use("/api/categories", require('./routes/categories'));
app.use("/api/coins", require('./routes/coins'));
app.use("/api/referrals", require('./routes/referrals'));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "CartQuest API is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;