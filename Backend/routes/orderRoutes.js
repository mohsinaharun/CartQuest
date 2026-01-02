import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * ✅ Create order (Checkout)
 * POST /api/orders
 */
router.post("/", async (req, res) => {
  try {
    const { items, total, customerName, phone, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = new Order({
      items,
      total,
      customerName,
      phone,
      address,
      status: "Pending"
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

export default router;
