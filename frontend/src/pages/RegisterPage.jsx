import { useState } from "react";
import { registerUser } from "../api/auth";

function RegisterPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = await registerUser({ name, email, password });
    console.log("register response:", data);
    // optionally switch to login on success:
    if (data && !data.error) onSwitch("login");
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>

      <form onSubmit={handleRegister} className="auth-form">
        <input
          className="auth-input"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button className="auth-button" type="submit">
          Register
        </button>
      </form>

      <div className="auth-footer">
        <button
          className="link-button"
          onClick={() => onSwitch && onSwitch("login")}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
