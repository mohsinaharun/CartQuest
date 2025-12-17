import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

export default variantSchema;
