import React, { useEffect, useState } from "react";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchOrders = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setErr("");
      const res = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();

      // update UI instantly
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    } catch (e) {
      setErr(e.message || "Error");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading orders...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Orders</h2>

      {err && (
        <div style={{ margin: "10px 0", color: "red" }}>
          {err}
        </div>
      )}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <b>Order:</b> {order._id}
                  <br />
                  <b>Customer:</b> {order.customerName} ({order.phone})
                  <br />
                  <b>Address:</b> {order.address}
                  <br />
                  <b>Total:</b> {order.total}
                  <br />
                  <b>Created:</b>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </div>

                <div>
                  <b>Status:</b>{" "}
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <hr style={{ margin: "12px 0" }} />

              <b>Items:</b>
              <ul style={{ marginTop: 8 }}>
                {order.items?.map((it, idx) => (
                  <li key={idx}>
                    {it.name} — {it.color || "-"} / {it.size || "-"} —{" "}
                    {it.quantity} × {it.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
