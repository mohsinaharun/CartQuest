import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String }, // ✅ color-wise photo
  },
  { timestamps: true }
);

const Variant = mongoose.model("Variant", variantSchema);
export default Variant;
