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

// Import and use routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/wheel", require("./routes/wheel"));
app.use("/api/addresses", require("./routes/address"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/payment", require("./routes/payment"));

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