import { BrowserRouter, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WheelPage from "./pages/WheelPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";
import MahiCoins from "./pages/MahiCoins";
import "./App.css";

function Layout() {
  const navigate = useNavigate();

  return (
    <div className="app-root">
      <div className="brand">
        <h1>Flipcart</h1>
      </div>

      <div className="auth-container">
        <Outlet />
      </div>

      <div className="corner-buttons">
        <button
          className="corner-wheel"
          onClick={() => navigate("/wheel")}
          aria-label="wheel"
          title="wheel"
        >
          🎡 Wheel
        </button>
        <button
          className="corner-coins"
          onClick={() => navigate("/mahi-coins")}
          aria-label="mahi coins"
          title="mahi coins"
        >
          🪙 Coins
        </button>
        <button
          className="corner-orders"
          onClick={() => navigate("/orders")}
          aria-label="orders"
          title="orders"
        >
          📦 Orders
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="wheel" element={<WheelPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="mahi-coins" element={<MahiCoins />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;