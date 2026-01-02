import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ TEST route (to confirm the file is loaded)
router.get("/test", (req, res) => {
  res.json({ ok: true, message: "adminProductRoutes working" });
});

// ✅ Admin: Add product
// POST /api/admin/products
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Admin add product error:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ Admin: Edit product
// PUT /api/admin/products/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("Admin edit product error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ Admin: Delete product
// DELETE /api/admin/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Admin delete product error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
