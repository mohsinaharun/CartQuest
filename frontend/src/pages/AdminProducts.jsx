import React, { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  // add form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); // categoryId
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // edit mode
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ---------- ADD ----------
  const addProduct = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Product name required");
    if (!price) return alert("Price required");
    if (!category.trim()) return alert("Category ID required");

    try {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          category: category.trim(),
          imageUrl: imageUrl.trim(), // ✅
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        return alert("Add failed");
      }

      const created = await res.json();
      setProducts((prev) => [...prev, created]);

      // reset add form
      setName("");
      setPrice("");
      setCategory("");
      setImageUrl("");
      setDescription("");
    } catch (e) {
      console.error(e);
      alert("Add failed");
    }
  };

  // ---------- DELETE ----------
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) return alert("Delete failed");
      setProducts((prev) => prev.filter((p) => p._id !== id));

      // if deleting the one you're editing
      if (editingId === id) cancelEdit();
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  // ---------- EDIT MODE ----------
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditName(p.name || "");
    setEditPrice(p.price ?? "");
    setEditCategory(p.category?._id || p.category || "");
    setEditImageUrl(p.imageUrl || "");
    setEditDescription(p.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditCategory("");
    setEditImageUrl("");
    setEditDescription("");
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!editingId) return;
    if (!editName.trim()) return alert("Name required");
    if (!editPrice) return alert("Price required");
    if (!editCategory.trim()) return alert("Category ID required");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/products/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            price: Number(editPrice),
            category: editCategory.trim(),
            imageUrl: editImageUrl.trim(), // ✅ edit image url
            description: editDescription.trim(),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        return alert("Update failed");
      }

      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      cancelEdit();
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Products</h2>

      {/* ADD PRODUCT */}
      <h3 style={{ marginTop: 20 }}>Add Product</h3>

      <form
        onSubmit={addProduct}
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Category ID"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <button type="submit">Add</button>
      </form>

      {/* EDIT PRODUCT */}
      {editingId && (
        <>
          <h3 style={{ marginTop: 30 }}>Edit Product</h3>

          <form
            onSubmit={updateProduct}
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              border: "1px solid #ddd",
              padding: 12,
              marginTop: 10,
            }}
          >
            <input
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              placeholder="Price"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
            <input
              placeholder="Category ID"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            />
            <input
              placeholder="Image URL"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <input
              placeholder="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{ minWidth: 260 }}
            />

            <button type="submit">Update</button>
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </form>
        </>
      )}

      {/* PRODUCTS TABLE */}
      <h3 style={{ marginTop: 30 }}>All Products</h3>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category?.name || p.category}</td>
                <td>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button onClick={() => startEdit(p)}>Edit</button>{" "}
                  <button
                    style={{ color: "red" }}
                    onClick={() => deleteProduct(p._id)}
                  >
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
