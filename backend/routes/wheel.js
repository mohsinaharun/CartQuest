const express = require("express");
const router = express.Router();
const Discount = require("../models/Discount");
const authMiddleware = require("../middleware/auth");

// Define wheel sectors: discounts plus special outcomes
const discounts = [5, 10, 15, 20, 25, 30, 50];
const specialOutcomes = [
  { type: "virtual_hug", label: "🎁 Virtual hug", message: "A warm virtual hug — you made our day!" },
  { type: "try_again", label: "🔁 Try again", message: "Not this time — spin again!" },
  { type: "nothing", label: "❌ Nothing", message: "No prize this spin. Better luck next time." }
];

// Build sectors array (mix discounts and special outcomes)
const sectors = [
  // include each discount as a sector
  ...discounts.map((d) => ({ type: "discount", label: `${d}% off`, value: d })),
  // include special outcomes
  ...specialOutcomes
];

// Generate unique discount code
const generateDiscountCode = () => {
  const prefix = "SAVE";
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}${randomNum}`;
};

// GET /api/wheel -> return current wheel sectors (for frontend to render)
router.get("/", (req, res) => {
  console.log("GET /api/wheel - Request received");
  console.log("Origin:", req.headers.origin);
  // send sectors with minimal fields for rendering
  const responseData = {
    sectors: sectors.map((s) => ({
      type: s.type,
      label: s.label,
      value: s.value ?? null
    }))
  };
  console.log("Sending sectors:", responseData);
  res.json(responseData);
});

// POST /api/wheel/spin -> return a random outcome and save discount if user is logged in
router.post("/spin", async (req, res) => {
  try {
    // simple random selection — you can replace this with weighted logic if desired
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const selected = sectors[randomIndex];

    // normalize response
    let outcome;
    if (selected.type === "discount") {
      outcome = {
        type: "discount",
        label: selected.label,
        value: selected.value,
        message: `You won ${selected.value}% off!`
      };
    } else if (selected.type === "virtual_hug") {
      outcome = {
        type: "virtual_hug",
        label: selected.label,
        message: selected.message
      };
    } else if (selected.type === "try_again") {
      outcome = {
        type: "try_again",
        label: selected.label,
        message: selected.message
      };
    } else {
      outcome = {
        type: "nothing",
        label: selected.label,
        message: selected.message ?? "No prize."
      };
    }

    // If user is authenticated and won a discount, save it to database
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token && outcome.type === "discount") {
      try {
        const jwt = require("jsonwebtoken");
        const User = require("../models/User");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
          // Generate unique discount code
          let discountCode;
          let isUnique = false;
          while (!isUnique) {
            discountCode = generateDiscountCode();
            const existing = await Discount.findOne({ discountCode });
            if (!existing) isUnique = true;
          }

          // Save discount to database
          const discount = new Discount({
            userId: user._id,
            discountValue: outcome.value,
            discountCode: discountCode
          });
          await discount.save();
          
          outcome.discountCode = discountCode;
          outcome.message = `You won ${outcome.value}% off! Use code: ${discountCode}`;
        }
      } catch (err) {
        // If token is invalid, just continue without saving (guest user)
        console.log("Guest spin or invalid token");
      }
    }

    res.json({ outcome });
  } catch (err) {
    console.error("Spin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/wheel/save-discount -> save discount for authenticated user
router.post("/save-discount", authMiddleware, async (req, res) => {
  try {
    const { discountValue } = req.body;
    
    if (!discountValue || typeof discountValue !== "number") {
      return res.status(400).json({ message: "Invalid discount value" });
    }

    // Generate unique discount code
    let discountCode;
    let isUnique = false;
    while (!isUnique) {
      discountCode = generateDiscountCode();
      const existing = await Discount.findOne({ discountCode });
      if (!existing) isUnique = true;
    }

    // Save discount to database
    const discount = new Discount({
      userId: req.user._id,
      discountValue: discountValue,
      discountCode: discountCode
    });
    await discount.save();
    
    res.json({ 
      message: "Discount saved successfully",
      discountCode: discountCode,
      discountValue: discountValue
    });
  } catch (err) {
    console.error("Save discount error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/wheel/my-discounts -> get all discounts for authenticated user
router.get("/my-discounts", authMiddleware, async (req, res) => {
  try {
    const discounts = await Discount.find({
      userId: req.user._id,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json({ discounts });
  } catch (err) {
    console.error("Get discounts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
