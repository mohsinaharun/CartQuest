import { useState } from "react";
import { spinWheel } from "../api/wheel";

function WheelPage() {
  const [outcome, setOutcome] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);

  const handleSpin = async () => {
    setSpinning(true);
    setOutcome(null);
    setError(null);

    try {
      const res = await spinWheel(); // expects { outcome: { type, label, value?, message } }
      const result = res?.outcome ?? null;
      // small UX delay for "spinning" feel
      setTimeout(() => {
        setOutcome(result);
        setSpinning(false);
      }, 900);
    } catch (err) {
      setError("Failed to spin. Try again.");
      setSpinning(false);
    }
  };

  const renderCenter = () => {
    if (spinning) return "🎡 Spinning...";
    if (!outcome) return "🎡";
    switch (outcome.type) {
      case "discount":
        return <span style={{fontSize:"2.2rem", fontWeight:700}}>{outcome.value}%</span>;
      case "virtual_hug":
        return <span style={{fontSize:"2rem"}}>🎁</span>;
      case "try_again":
        return <span style={{fontSize:"2rem"}}>🔁</span>;
      case "nothing":
      default:
        return <span style={{fontSize:"2rem"}}>❌</span>;
    }
  };

  const renderMessage = () => {
    if (error) return <p style={{ marginTop: 20, color: "crimson" }}>{error}</p>;
    if (!outcome) return null;

    switch (outcome.type) {
      case "discount":
        return (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{outcome.message}</p>
            <p style={{ margin: "6px 0 0", color: "#475569" }}>
              Code: SAVE{outcome.value} (example)
            </p>
          </div>
        );
      case "virtual_hug":
        return (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{outcome.label}</p>
            <p style={{ margin: "6px 0 0", color: "#475569" }}>{outcome.message}</p>
          </div>
        );
      case "try_again":
        return (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{outcome.message}</p>
            <button
              onClick={handleSpin}
              disabled={spinning}
              style={{
                marginTop: 10,
                padding: "8px 18px",
                background: "#f59e0b",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              Spin again
            </button>
          </div>
        );
      case "nothing":
      default:
        return (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{outcome.message ?? "No prize this time."}</p>
            <p style={{ marginTop: 6, color: "#475569" }}>Better luck next spin.</p>
          </div>
        );
    }
  };

  return (
    <div style={{
      textAlign: "center",
      padding: "50px",
      fontFamily: "Inter, Arial, sans-serif",
      minHeight: "70vh"
    }}>
      <h2>Spin the Wheel!</h2>

      <div style={{
        width: "320px",
        height: "320px",
        margin: "40px auto",
        borderRadius: "50%",
        border: `12px solid ${spinning ? "#fde68a" : "#f0c14b"}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem",
        background: spinning ? "#fff7ed" : "#fff3e0",
        transition: "all 650ms ease"
      }}>
        {renderCenter()}
      </div>

      <div>
        <button
          onClick={handleSpin}
          disabled={spinning}
          style={{
            padding: "12px 30px",
            fontSize: "1rem",
            cursor: spinning ? "not-allowed" : "pointer",
            background: "#f59e0b",
            border: "none",
            borderRadius: "8px",
            color: "#111827",
            fontWeight: 700
          }}
        >
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>

      {renderMessage()}
    </div>
  );
}

export default WheelPage;
