const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    discountCode: {
      type: String,
      required: true,
      unique: true
    },
    used: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Discount expires in 30 days
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", DiscountSchema);

