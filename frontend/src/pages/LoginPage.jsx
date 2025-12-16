import { useState } from "react";
import { loginUser } from "../api/auth";

function LoginPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await loginUser({ email, password });
    console.log("login response:", data);
    // handle storing token / redirect after success
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
          onClick={() => onSwitch && onSwitch("register")}
        >
          Create account
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
