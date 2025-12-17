import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products?category=<id or all>&maxPrice=10000
router.get("/", async (req, res) => {
  try {
    const { category, maxPrice } = req.query;
    const filter = {};

    // category filter – products.category is an ObjectId
    if (category && category !== "all") {
         filter.category = category; // let Mongoose handle casting
}


    // price filter
    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    // ✅ FIX: populate category so frontend gets category.name
    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
