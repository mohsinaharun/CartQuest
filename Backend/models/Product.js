import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // ✅ This enables .populate("category")
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
