import express from "express";
import Variant from "../models/Variant.js";

const router = express.Router();

/**
 * ✅ Get variants of a product
 * GET /api/admin/variants?productId=XXXX
 */
router.get("/", async (req, res) => {
  try {
    const { productId } = req.query;
    const filter = {};

    if (productId) filter.product = productId;

    const variants = await Variant.find(filter);
    res.json(variants);
  } catch (err) {
    console.error("Get variants error:", err);
    res.status(500).json({ message: "Failed to fetch variants" });
  }
});

/**
 * ✅ Add variant
 * POST /api/admin/variants
 */
router.post("/", async (req, res) => {
  try {
    const variant = await Variant.create(req.body);
    res.status(201).json(variant);
  } catch (err) {
    console.error("Add variant error:", err);
    res.status(500).json({ message: "Failed to add variant" });
  }
});

/**
 * ✅ Edit variant
 * PUT /api/admin/variants/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Variant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Variant not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update variant error:", err);
    res.status(500).json({ message: "Failed to update variant" });
  }
});

/**
 * ✅ Delete variant
 * DELETE /api/admin/variants/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Variant.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Variant not found" });

    res.json({ message: "Variant deleted successfully" });
  } catch (err) {
    console.error("Delete variant error:", err);
    res.status(500).json({ message: "Failed to delete variant" });
  }
});

export default router;
