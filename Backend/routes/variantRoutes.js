import express from "express";
import Variant from "../models/Variant.js";

const router = express.Router();

// GET /api/variants/:productId  -> all variants for a product
router.get("/:productId", async (req, res) => {
  try {
    const variants = await Variant.find({ product: req.params.productId });
    res.json(variants);
  } catch (err) {
    console.error("Error fetching variants:", err);
    res.status(500).json({ message: "Failed to fetch variants" });
  }
});

export default router;
