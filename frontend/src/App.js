import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Variants data for selected product
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState("");

  // Variant selection state
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);

  // ---------- helpers ----------
  const productPriceDisplay = (p) => `৳ ${p?.price ?? "-"}`;

  // Convert color name to a dot color (simple mapping + fallback)
  const colorToHex = (c) => {
    const x = (c || "").toLowerCase();
    if (x.includes("black")) return "#111";
    if (x.includes("white")) return "#fff";
    if (x.includes("red")) return "#e11d48";
    if (x.includes("blue")) return "#2563eb";
    if (x.includes("green")) return "#16a34a";
    if (x.includes("yellow")) return "#facc15";
    if (x.includes("pink")) return "#fb7185";
    if (x.includes("brown")) return "#7c4a2d";
    if (x.includes("gray") || x.includes("grey")) return "#9ca3af";
    if (x.includes("cream") || x.includes("beige")) return "#f3e8d3";
    return "#ddd";
  };

  // ---------- derived data ----------
  const colors = useMemo(() => {
    const set = new Set(variants.map((v) => v.color));
    return [...set].filter(Boolean);
  }, [variants]);

  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor) return [];
    const set = new Set(
      variants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size)
    );
    return [...set].filter(Boolean);
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
      null
    );
  }, [variants, selectedColor, selectedSize]);

  // ✅ IMPORTANT: preview image changes when ONLY color is selected
  const previewVariant = useMemo(() => {
    // 1) exact selected variant has image
    if (selectedVariant?.imageUrl) return selectedVariant;

    // 2) any variant of selected color that has image
    if (selectedColor) {
      const v = variants.find((x) => x.color === selectedColor && x.imageUrl);
      if (v) return v;
    }

    return null;
  }, [selectedVariant, selectedColor, variants]);

  // ---------- API calls ----------
  const loadVariants = async (productId) => {
    try {
      setVariantsError("");
      setVariantsLoading(true);

      const res = await fetch(`http://localhost:5000/api/variants/${productId}`);
      const data = await res.json();

      if (!res.ok) {
        setVariants([]);
        setVariantsError(data?.message || "Failed to load variants");
        return;
      }

      // ✅ data must include imageUrl from DB
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading variants:", err);
      setVariants([]);
      setVariantsError("Failed to load variants");
    } finally {
      setVariantsLoading(false);
    }
  };

  // Fetch products on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (maxPrice) params.append("maxPrice", maxPrice);

    const url = `http://localhost:5000/api/products?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching products:", err));
  }, [selectedCategory, maxPrice]);

  // ---------- drawer controls ----------
  const openDrawer = async (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);

    // reset selection
    setVariants([]);
    setSelectedColor("");
    setSelectedSize("");
    setVariantsError("");

    await loadVariants(product._id);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
    setVariants([]);
    setVariantsError("");
    setSelectedColor("");
    setSelectedSize("");
  };

  // Esc closes drawer
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (drawerOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  // ---------- category ids ----------
  const SHOES_ID = "69415dfb91ebe3bc291db066";
  const BAGS_ID = "694103df91ebe3bc291db01d";
  const ACCESSORIES_ID = "694103f791ebe3bc291db01f";
  const CLOTHES_ID = "6941040b91ebe3bc291db021";

  return (
    <div className="page pastel-bg">
      <header className="header">
        <h1 className="title">CartQuest</h1>
        <p className="subtitle">Soft essentials for everyday elegance</p>
      </header>

      <main className="content content-soft">
        {products.length === 0 && (
          <p className="info-text">Loading products or no products found.</p>
        )}

        {/* Filters */}
        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            <option value={SHOES_ID}>Shoes</option>
            <option value={BAGS_ID}>Bags</option>
            <option value={ACCESSORIES_ID}>Accessories</option>
            <option value={CLOTHES_ID}>Clothes</option>
          </select>

          <div className="price-filter">
            <label>Max price: ৳ {maxPrice}</label>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Product cards */}
        <div className="product-grid tall-cards">
          {products.map((p) => (
            <article className="product-card pastel-card" key={p._id}>
              {p.imageUrl && (
                <div className="product-image-wrap">
                  <img className="product-image" src={p.imageUrl} alt={p.name} />
                </div>
              )}

              <div className="product-badge badge-soft">
                {p.category?.name || "Category"}
              </div>

              <h2 className="product-name name-soft">{p.name}</h2>
              <p className="product-description desc-soft">{p.description}</p>

              <div className="product-footer footer-soft">
                <span className="product-price price-soft">
                  {productPriceDisplay(p)}
                </span>

                <button className="product-btn btn-soft" onClick={() => openDrawer(p)}>
                  Select options
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Drawer + Backdrop */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={closeDrawer} />

          <aside className="drawer" role="dialog" aria-modal="true">
            <div className="drawer-header">
              <div>
                <div className="drawer-title">{selectedProduct?.name}</div>
                <div className="drawer-subtitle">
                  {selectedProduct?.category?.name || "Category"} • Base{" "}
                  {productPriceDisplay(selectedProduct)}
                </div>
              </div>

              <button className="drawer-close" onClick={closeDrawer} aria-label="Close">
                ✕
              </button>
            </div>

            {/* ✅ Drawer image: changes when color is clicked */}
            {(previewVariant?.imageUrl || selectedProduct?.imageUrl) && (
              <div className="drawer-image-wrap">
                <img
                  className="drawer-image"
                  src={previewVariant?.imageUrl || selectedProduct.imageUrl}
                  alt={selectedProduct?.name || "Product"}
                  onError={() => {
                    console.log(
                      "IMAGE FAILED:",
                      previewVariant?.imageUrl || selectedProduct?.imageUrl
                    );
                  }}
                />
              </div>
            )}

            <div className="drawer-body">
              <h3 className="drawer-section-title">Choose color</h3>

              {variantsLoading && <p className="info-text">Loading variants...</p>}

              {!variantsLoading && variantsError && (
                <p className="info-text">{variantsError}</p>
              )}

              {!variantsLoading && !variantsError && variants.length === 0 && (
                <p className="info-text">
                  No variants found for this product.
                </p>
              )}

              {!variantsLoading && variants.length > 0 && (
                <>
                  {/* Color circles */}
                  <div className="color-row">
                    {colors.map((c) => {
                      const colorHasStock = variants.some(
                        (v) => v.color === c && (v.stock ?? 0) > 0
                      );
                      const active = selectedColor === c;

                      return (
                        <button
                          key={c}
                          className={`color-dot ${active ? "active" : ""} ${
                            !colorHasStock ? "disabled" : ""
                          }`}
                          onClick={() => {
                            if (!colorHasStock) return;
                            setSelectedColor(c);
                            setSelectedSize("");
                          }}
                          title={c}
                          aria-label={`Select color ${c}`}
                        >
                          <span
                            className="color-dot-inner"
                            style={{ background: colorToHex(c) }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {selectedColor && (
                    <div className="selected-label">
                      Selected color: <b>{selectedColor}</b>
                    </div>
                  )}

                  <h3 className="drawer-section-title" style={{ marginTop: 12 }}>
                    Choose size
                  </h3>

                  {!selectedColor ? (
                    <p className="info-text">Select a color to see available sizes.</p>
                  ) : (
                    <div className="size-row">
                      {sizesForSelectedColor.map((s) => {
                        const v = variants.find(
                          (x) => x.color === selectedColor && x.size === s
                        );
                        const inStock = (v?.stock ?? 0) > 0;
                        const active = selectedSize === s;

                        return (
                          <button
                            key={s}
                            className={`size-chip ${active ? "active" : ""} ${
                              !inStock ? "disabled" : ""
                            }`}
                            onClick={() => {
                              if (!inStock) return;
                              setSelectedSize(s);
                            }}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected variant summary */}
                  <div className="variant-summary">
                    <div>
                      Price:{" "}
                      <b>৳ {selectedVariant?.price ?? selectedProduct?.price ?? "-"}</b>
                    </div>
                    <div>
                      Stock: <b>{selectedVariant ? selectedVariant.stock : "-"}</b>
                    </div>
                  </div>

                  <button
                    className="variant-add"
                    disabled={!selectedVariant || (selectedVariant.stock ?? 0) <= 0}
                    onClick={() =>
                      alert(
                        `Next step: add to cart\nProduct: ${selectedProduct?.name}\nVariant: ${selectedVariant.size}/${selectedVariant.color}\nPrice: ৳${selectedVariant.price}`
                      )
                    }
                  >
                    Add to Cart
                  </button>

                  {!selectedVariant && (
                    <p className="info-text" style={{ marginTop: 8 }}>
                      Please select both color and size.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="drawer-footer">
              <button className="drawer-secondary" onClick={closeDrawer}>
                Continue shopping
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default App;
