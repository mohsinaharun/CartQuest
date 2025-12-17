import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);

  // call backend whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== "all") {
      params.append("category", selectedCategory);
    }
    if (maxPrice) {
      params.append("maxPrice", maxPrice);
    }

    const url = `http://localhost:5000/api/products?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [selectedCategory, maxPrice]);

  // real category ids from MongoDB
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
                  <img
                    className="product-image"
                    src={p.imageUrl}
                    alt={p.name}
                  />
                </div>
              )}

              <div className="product-badge badge-soft">
                {p.category?.name || "Category"}
              </div>
              <h2 className="product-name name-soft">{p.name}</h2>
              <p className="product-description desc-soft">
                {p.description}
              </p>

              <div className="product-footer footer-soft">
                <span className="product-price price-soft">
                  ৳ {p.price}
                </span>
                <button className="product-btn btn-soft">Add to bag</button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
