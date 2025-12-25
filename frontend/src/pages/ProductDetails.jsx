import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

export default function ProductDetails() {
  const { id } = useParams(); // productId from URL
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 1) load product (existing API)
        const pRes = await fetch(`http://localhost:5000/api/products?category=all&maxPrice=1000000`);
        const pData = await pRes.json();
        const found = pData.find((x) => x._id === id);
        setProduct(found || null);

        // 2) load variants
        const vRes = await fetch(`http://localhost:5000/api/variants/${id}`);
        const vData = await vRes.json();
        setVariants(Array.isArray(vData) ? vData : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // sizes and colors from variants
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);

  useEffect(() => {
    const v = variants.find(
      (x) => x.size === selectedSize && x.color === selectedColor
    );
    setSelectedVariant(v || null);
  }, [selectedSize, selectedColor, variants]);

  if (loading) {
    return (
      <div className="page pastel-bg">
        <div className="content content-soft">
          <p className="info-text">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page pastel-bg">
        <div className="content content-soft">
          <p className="info-text">Product not found.</p>
          <button className="product-btn btn-soft" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page pastel-bg">
      <header className="header">
        <h1 className="title">{product.name}</h1>
        <p className="subtitle">{product.category?.name}</p>
      </header>

      <main className="content content-soft">
        <button className="product-btn btn-soft" onClick={() => navigate("/")}>
          ← Back to products
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
          <div>
            {product.imageUrl && (
              <div className="product-image-wrap">
                <img className="product-image" src={product.imageUrl} alt={product.name} />
              </div>
            )}
            <p className="product-description desc-soft" style={{ marginTop: 10 }}>
              {product.description}
            </p>
          </div>

          <div>
            <h3 style={{ marginTop: 0 }}>Choose options</h3>

            {/* Size */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #f2c9b3" }}
              >
                <option value="">Select size</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #f2c9b3" }}
              >
                <option value="">Select color</option>
                {colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="product-price price-soft">
                Price: ৳ {selectedVariant?.price ?? product.price}
              </div>
              <div className="info-text" style={{ marginTop: 6 }}>
                Stock: {selectedVariant ? selectedVariant.stock : "Select size & color"}
              </div>

              <button
                className="product-btn btn-soft"
                style={{ marginTop: 12 }}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onClick={() => alert("Next step: add to cart with selected variant")}
              >
                Add to cart
              </button>

              {!selectedVariant && (
                <p className="info-text" style={{ marginTop: 8 }}>
                  Please select both size and color.
                </p>
              )}
            </div>

            <hr style={{ margin: "18px 0", borderColor: "#ffe2cf" }} />
            <h4 style={{ margin: 0 }}>Available variants</h4>
            {variants.length === 0 ? (
              <p className="info-text">No variants found for this product.</p>
            ) : (
              variants.map((v) => (
                <div key={v._id} style={{ padding: 10, marginTop: 8, border: "1px solid #f2c9b3", borderRadius: 12, background: "#fffaf6" }}>
                  Size: <b>{v.size}</b> | Color: <b>{v.color}</b> | ৳ <b>{v.price}</b> | Stock: <b>{v.stock}</b>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
