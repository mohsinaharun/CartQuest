import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("Login successful, token stored");
        // Optionally redirect or show success message
      } else if (data.message) {
        alert(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-card">
      <h2>LOGIN</h2>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-button" type="submit">
          Login
        </button>
      </form>

      <div className="auth-footer">
        <span>Don't have an account?</span>
        <button
          className="link-button"
          onClick={() => navigate("/register")}
        >
          Create account
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
