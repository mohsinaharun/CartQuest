import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// ✅ Admin: View all orders
// GET /api/admin/orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Admin get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ✅ Admin: Update order status
// PUT /api/admin/orders/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json(updated);
  } catch (err) {
    console.error("Admin update order status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;
