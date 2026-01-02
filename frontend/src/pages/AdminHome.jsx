import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={() => navigate("/admin/products")}>
          Manage Products
        </button>

        <button onClick={() => navigate("/admin/variants")}>
          Manage Variants
        </button>

        <button onClick={() => navigate("/admin/orders")}>
          Manage Orders
        </button>
      </div>

      <p style={{ marginTop: 20, color: "#555" }}>
        Tip: Bookmark this page → <b>/admin</b>
      </p>
    </div>
  );
}
