import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminVariants from "./pages/AdminVariants";
import AdminHome from "./pages/AdminHome";

/**
 * Cart item shape:
 * {
 *   key: string (productId|variantId),
 *   productId,
 *   variantId,
 *   name,
 *   categoryName,
 *   color,
 *   size,
 *   price,
 *   imageUrl,
 *   qty
 * }
 */

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cartquest_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cartquest_cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, it) => sum + (it.qty || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, it) => sum + (it.price * it.qty), 0),
    [cart]
  );

  const addToCart = (product, variant) => {
    const key = `${product._id}|${variant._id}`;
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.key === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }

      return [
        ...prev,
        {
          key,
          productId: product._id,
          variantId: variant._id,
          name: product.name,
          categoryName: product.category?.name || "Category",
          color: variant.color,
          size: variant.size,
          price: variant.price,
          imageUrl: variant.imageUrl || product.imageUrl,
          qty: 1,
        },
      ];
    });
  };

  const incQty = (key) => {
    setCart((prev) =>
      prev.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it))
    );
  };

  const decQty = (key) => {
    setCart((prev) =>
      prev
        .map((it) => (it.key === key ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeItem = (key) => {
    setCart((prev) => prev.filter((it) => it.key !== key));
  };

  const clearCart = () => setCart([]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProductsPage
            cartCount={cartCount}
            cartTotal={cartTotal}
            cart={cart}
            addToCart={addToCart}
          />
        }
      />
      <Route
        path="/cart"
        element={
          <CartPage
            cart={cart}
            cartTotal={cartTotal}
            incQty={incQty}
            decQty={decQty}
            removeItem={removeItem}
            clearCart={clearCart}
          />
        }
      />
        
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/variants" element={<AdminVariants />} />
        <Route path="/admin" element={<AdminHome />} />
    </Routes>
    
  );
}

/* -------------------- Products Page (with Drawer) -------------------- */

function ProductsPage({ cartCount, cartTotal, addToCart }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Variants data
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState("");

  // Selected options
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);

  // Toast popup
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 1600);
  };

  // category ids
  const SHOES_ID = "69415dfb91ebe3bc291db066";
  const BAGS_ID = "694103df91ebe3bc291db01d";
  const ACCESSORIES_ID = "694103f791ebe3bc291db01f";
  const CLOTHES_ID = "6941040b91ebe3bc291db021";

  const productPriceDisplay = (p) => `৳ ${p?.price ?? "-"}`;

  const colorToHex = (c) => {
    const x = (c || "").toLowerCase().trim();
    if (x.includes("black")) return "#111";
    if (x.includes("white")) return "#fff";
    if (x.includes("red")) return "#e11d48";
    if (x.includes("blue")) return "#2563eb";
    if (x.includes("green")) return "#16a34a";
    if (x.includes("yellow")) return "#facc15";
    if (x.includes("pink")) return "#fb7185";
    if (x.includes("brown")) return "#7c4a2d";
    if (x.includes("gray") || x.includes("grey")) return "#9ca3af";
    return "#ddd";
  };

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
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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

  const openDrawer = async (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);

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

  // Derived: available colors from variants
  const colors = useMemo(() => {
    const set = new Set(variants.map((v) => (v.color || "").trim()).filter(Boolean));
    return [...set];
  }, [variants]);

  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor) return [];
    const sc = selectedColor.trim().toLowerCase();
    const set = new Set(
      variants
        .filter((v) => (v.color || "").trim().toLowerCase() === sc)
        .map((v) => (v.size || "").trim())
        .filter(Boolean)
    );
    return [...set];
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    const sc = selectedColor.trim().toLowerCase();
    const ss = selectedSize.trim().toLowerCase();

    return (
      variants.find(
        (v) =>
          (v.color || "").trim().toLowerCase() === sc &&
          (v.size || "").trim().toLowerCase() === ss
      ) || null
    );
  }, [variants, selectedColor, selectedSize]);

  const previewVariant = useMemo(() => {
    if (selectedVariant?.imageUrl) return selectedVariant;
    if (selectedColor) {
      const sc = selectedColor.trim().toLowerCase();
      const v = variants.find(
        (x) => (x.color || "").trim().toLowerCase() === sc && x.imageUrl
      );
      if (v) return v;
    }
    return null;
  }, [variants, selectedColor, selectedVariant]);

  const drawerPrice = selectedVariant?.price ?? selectedProduct?.price ?? 0;
  const drawerStock = selectedVariant?.stock ?? null;

  return (
    <div className="page pastel-bg">
      {/* Top bar with Cart icon */}
      <div className="topbar">
        <div className="topbar-left" />
        <button className="cart-btn" onClick={() => navigate("/cart")}>
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          <span className="cart-total-mini">৳ {cartTotal}</span>
        </button>
      </div>

      <header className="header">
        <h1 className="title">CartQuest</h1>
        <p className="subtitle">Soft essentials for everyday elegance</p>
      </header>

      <main className="content content-soft">
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

        {/* Product grid */}
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
                <span className="product-price price-soft">{productPriceDisplay(p)}</span>
                <button className="product-btn btn-soft" onClick={() => openDrawer(p)}>
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Drawer */}
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

            {(previewVariant?.imageUrl || selectedProduct?.imageUrl) && (
              <div className="drawer-image-wrap">
                <img
                  className="drawer-image"
                  src={previewVariant?.imageUrl || selectedProduct.imageUrl}
                  alt={selectedProduct?.name || "Product"}
                />
              </div>
            )}

            <div className="drawer-body">
              {variantsLoading && <p className="info-text">Loading variants...</p>}
              {!variantsLoading && variantsError && (
                <p className="info-text">{variantsError}</p>
              )}

              {!variantsLoading && !variantsError && variants.length === 0 && (
                <p className="info-text">No variants found for this product.</p>
              )}

              {!variantsLoading && variants.length > 0 && (
                <>
                  <h3 className="drawer-section-title">Choose color</h3>
                  <div className="color-row">
                    {colors.map((c) => {
                      const hasStock = variants.some(
                        (v) => (v.color || "").trim().toLowerCase() === c.trim().toLowerCase() && (v.stock ?? 0) > 0
                      );
                      const active = selectedColor === c;

                      return (
                        <button
                          key={c}
                          className={`color-dot ${active ? "active" : ""} ${
                            !hasStock ? "disabled" : ""
                          }`}
                          onClick={() => {
                            if (!hasStock) return;
                            setSelectedColor(c);
                            setSelectedSize("");
                          }}
                          title={c}
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
                        const sc = selectedColor.trim().toLowerCase();
                        const v = variants.find(
                          (x) =>
                            (x.color || "").trim().toLowerCase() === sc &&
                            (x.size || "").trim() === s
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

                  <div className="variant-summary">
                    <div>
                      Price: <b>৳ {drawerPrice}</b>
                    </div>
                    <div>
                      Stock: <b>{drawerStock ?? "-"}</b>
                    </div>
                  </div>

                  <button
                    className="variant-add"
                    disabled={!selectedVariant || (selectedVariant.stock ?? 0) <= 0}
                    onClick={() => {
                      if (!selectedProduct || !selectedVariant) return;
                      addToCart(selectedProduct, selectedVariant);
                      showToast("Item added to cart ✅");
                    }}
                  >
                    ADD TO CART
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

/* -------------------- Cart Page -------------------- */

function CartPage({ cart, cartTotal, incQty, decQty, removeItem, clearCart }) {
  const navigate = useNavigate();

  return (
    <div className="page pastel-bg">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="cart-title">Your Cart</div>
      </div>

      <main className="content content-soft">
        {cart.length === 0 ? (
          <div style={{ padding: 12 }}>
            <p className="info-text">Your cart is empty.</p>
            <button className="product-btn btn-soft" onClick={() => navigate("/")}>
              Shop products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((it) => (
                <div className="cart-item" key={it.key}>
                  <div className="cart-thumb">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt={it.name} />
                    ) : (
                      <div className="cart-thumb-fallback">🛍️</div>
                    )}
                  </div>

                  <div className="cart-info">
                    <div className="cart-name">{it.name}</div>
                    <div className="cart-meta">
                      {it.categoryName} • {it.color} • Size {it.size}
                    </div>
                    <div className="cart-price">৳ {it.price}</div>

                    <div className="qty-row">
                      <button className="qty-btn" onClick={() => decQty(it.key)}>
                        −
                      </button>
                      <span className="qty-num">{it.qty}</span>
                      <button className="qty-btn" onClick={() => incQty(it.key)}>
                        +
                      </button>

                      <button className="remove-btn" onClick={() => removeItem(it.key)}>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-line-total">
                    ৳ {it.price * it.qty}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Total</span>
                <b>৳ {cartTotal}</b>
              </div>

              <div className="summary-actions">
                <button className="drawer-secondary" onClick={clearCart}>
                  Clear cart
                </button>
                <button
                  className="variant-add"
                  onClick={() => alert("Next: checkout / order creation")}
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
