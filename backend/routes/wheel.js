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

// GET /api/wheel -> return current wheel sectors (for frontend to render)
router.get("/", (req, res) => {
  // send sectors with minimal fields for rendering
  res.json({
    sectors: sectors.map((s) => ({
      type: s.type,
      label: s.label,
      value: s.value ?? null
    }))
  });
});

// POST /api/wheel/spin -> return a random outcome
router.post("/spin", (req, res) => {
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

  res.json({ outcome });
});

module.exports = router;
