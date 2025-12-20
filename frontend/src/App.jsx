import { BrowserRouter, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WheelPage from "./pages/WheelPage";
import GuessPricePage from "./pages/GuessPricePage";
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

      <button
        className="corner-wheel"
        onClick={() => navigate("/wheel")}
        aria-label="wheel"
        title="wheel"
      >
        wheel
      </button>

      <button
        className="corner-guess"
        onClick={() => navigate("/guess")}
        aria-label="guess the price"
        title="guess the price"
      >
        Guess the Price
      </button>
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
          <Route path="guess" element={<GuessPricePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
