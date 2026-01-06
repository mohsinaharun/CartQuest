const express = require("express");
const router = express.Router();

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

const auth = require("../middleware/auth");
const User = require("../models/User");

// ... imports and sectors consts remain ...

// GET /api/wheel -> Public
router.get("/", (req, res) => {
  // ... existing logic ...
  res.json({
    sectors: sectors.map((s) => ({
      type: s.type,
      label: s.label,
      value: s.value ?? null
    }))
  });
});

// POST /api/wheel/spin -> Private, saves coupon
router.post("/spin", auth, async (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const selected = sectors[randomIndex];
    let outcome;

    if (selected.type === "discount") {
      const couponCode = `SAVE${selected.value}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Save to user
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          coupons: {
            code: couponCode,
            discount: selected.value,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        }
      });

      outcome = {
        type: "discount",
        label: selected.label,
        value: selected.value,
        code: couponCode, // Return the code!
        message: `You won ${selected.value}% off! Code: ${couponCode}`
      };
    } else {
      // ... handle other types ...
      outcome = {
        type: selected.type,
        label: selected.label,
        message: selected.message || "Better luck next time"
      };
    }

    res.json({ outcome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
