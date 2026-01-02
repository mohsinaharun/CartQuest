import React, { useEffect, useState } from "react";

export default function AdminVariants() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [variants, setVariants] = useState([]);

  // add form states
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // edit mode states
  const [editingId, setEditingId] = useState(null);
  const [editColor, setEditColor] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Load products
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        if (data.length > 0) setProductId(data[0]._id);
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to load products");
      });
  }, []);

  // Load variants (for selected product)
  const loadVariants = async (pid) => {
    if (!pid) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/variants?productId=${pid}`
      );
      const data = await res.json();
      setVariants(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load variants");
    }
  };

  useEffect(() => {
    loadVariants(productId);
  }, [productId]);

  // Add variant
  const addVariant = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productId,
          color: color.trim(),
          size: size.trim(),
          price: Number(price),
          stock: Number(stock),
          imageUrl: imageUrl.trim(),
        }),
      });

      if (!res.ok) return alert("Add variant failed");

      const created = await res.json();
      setVariants((prev) => [...prev, created]);

      setColor("");
      setSize("");
      setPrice("");
      setStock("");
      setImageUrl("");
    } catch (e) {
      console.error(e);
      alert("Add variant failed");
    }
  };

  // Start edit mode
  const startEdit = (v) => {
    setEditingId(v._id);
    setEditColor(v.color || "");
    setEditSize(v.size || "");
    setEditPrice(v.price ?? "");
    setEditStock(v.stock ?? "");
    setEditImageUrl(v.imageUrl || "");
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setEditColor("");
    setEditSize("");
    setEditPrice("");
    setEditStock("");
    setEditImageUrl("");
  };

  // Update variant (edit all fields)
  const updateVariant = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    if (!editColor.trim()) return alert("Color required");
    if (!editSize.trim()) return alert("Size required");
    if (editPrice === "") return alert("Price required");
    if (editStock === "") return alert("Stock required");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/variants/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // product is optional to update; keep variant under same product
            color: editColor.trim(),
            size: editSize.trim(),
            price: Number(editPrice),
            stock: Number(editStock),
            imageUrl: editImageUrl.trim(),
          }),
        }
      );

      if (!res.ok) return alert("Update failed");

      const updated = await res.json();

      setVariants((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x))
      );

      cancelEdit();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  // Delete variant
  const deleteVariant = async (id) => {
    if (!window.confirm("Delete variant?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/variants/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) return alert("Delete failed");

      setVariants((prev) => prev.filter((v) => v._id !== id));

      if (editingId === id) cancelEdit();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Variants</h2>

      {/* Product selector */}
      <div style={{ marginBottom: 16 }}>
        <b>Select Product: </b>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Variant Form */}
      <form onSubmit={addVariant} style={{ marginBottom: 20 }}>
        <h4>Add Variant</h4>
        <input
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
        />{" "}
        <input
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          required
        />{" "}
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />{" "}
        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />{" "}
        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ minWidth: 260 }}
        />{" "}
        <button type="submit">Add Variant</button>
      </form>

      {/* Edit Variant Form */}
      {editingId && (
        <form
          onSubmit={updateVariant}
          style={{
            marginBottom: 20,
            padding: 12,
            border: "1px solid #ddd",
          }}
        >
          <h4>Edit Variant</h4>

          <input
            placeholder="Color"
            value={editColor}
            onChange={(e) => setEditColor(e.target.value)}
            required
          />{" "}
          <input
            placeholder="Size"
            value={editSize}
            onChange={(e) => setEditSize(e.target.value)}
            required
          />{" "}
          <input
            placeholder="Price"
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            required
          />{" "}
          <input
            placeholder="Stock"
            type="number"
            value={editStock}
            onChange={(e) => setEditStock(e.target.value)}
            required
          />{" "}
          <input
            placeholder="Image URL"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            style={{ minWidth: 260 }}
          />{" "}
          <button type="submit">Update</button>{" "}
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </form>
      )}

      {/* Variants Table */}
      {variants.length === 0 ? (
        <p>No variants.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Color</th>
              <th>Size</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {variants.map((v) => (
              <tr key={v._id}>
                <td>{v.color}</td>
                <td>{v.size}</td>
                <td>{v.price}</td>
                <td>{v.stock}</td>
                <td>
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt="" style={{ width: 50 }} />
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button onClick={() => startEdit(v)}>Edit</button>{" "}
                  <button style={{ color: "red" }} onClick={() => deleteVariant(v._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
