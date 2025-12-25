import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import "./models/Category.js";
import "./models/Image.js";
import "./models/Variant.js";
import "./models/Product.js";

import productRoutes from "./routes/productRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve local images from Backend/uploads
// This makes URLs like: http://localhost:5000/uploads/yourimage.jpg work
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("Serving uploads from:", path.join(__dirname, "uploads"));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB error:", err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
