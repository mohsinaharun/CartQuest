const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    coupons: [{
      code: String,
      discount: Number, // Percentage
      expires: Date,
      createdAt: { type: Date, default: Date.now }
    }],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    coins: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Hash password before save
// Hash password before save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare provided password with stored hash
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
