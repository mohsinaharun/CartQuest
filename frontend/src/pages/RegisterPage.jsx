import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser({ name, email, password });
      console.log("register response:", data);
      // Navigate to login on success:
      if (data && !data.error && !data.message?.includes("error")) {
        alert("Registration successful! Please login.");
        navigate("/");
      } else if (data.message) {
        alert(data.message);
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed. Please try again.");
    }
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
          onClick={() => navigate("/")}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
