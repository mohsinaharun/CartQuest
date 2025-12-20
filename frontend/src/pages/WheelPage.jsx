import { useState, useRef } from "react";
import { saveDiscount } from "../api/wheel";

// Define sectors locally (same as backend)
const discounts = [5, 10, 15, 20, 25, 30, 50];
const specialOutcomes = [
  { type: "virtual_hug", label: "🎁 Virtual hug", message: "A warm virtual hug — you made our day!" },
  { type: "try_again", label: "🔁 Try again", message: "Not this time — spin again!" },
  { type: "nothing", label: "❌ Nothing", message: "No prize this spin. Better luck next time." }
];

const sectors = [
  ...discounts.map((d) => ({ type: "discount", label: `${d}% off`, value: d })),
  ...specialOutcomes
];

// Verify sectors
console.log("Wheel sectors defined:", sectors.length, "sectors");
sectors.forEach((s, i) => console.log(`Sector ${i}:`, s.type, s.value || s.label));

function WheelPage() {
  const [outcome, setOutcome] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const wheelRef = useRef(null);

  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setOutcome(null);
    setError(null);
    setSelectedIndex(null);

    // Randomly select a sector (frontend only)
    const randomIndex = Math.floor(Math.random() * sectors.length);
    const selected = sectors[randomIndex];

    // Create outcome object
    let result;
    if (selected.type === "discount") {
      result = {
        type: "discount",
        label: selected.label,
        value: selected.value,
        message: `You won ${selected.value}% off!`
      };
    } else if (selected.type === "virtual_hug") {
      result = {
        type: "virtual_hug",
        label: selected.label,
        message: selected.message
      };
    } else if (selected.type === "try_again") {
      result = {
        type: "try_again",
        label: selected.label,
        message: selected.message
      };
    } else {
      result = {
        type: "nothing",
        label: selected.label,
        message: selected.message ?? "No prize."
      };
    }

    // Calculate rotation to land on selected sector
    const sectorAngle = 360 / sectors.length;
    const targetAngle = randomIndex * sectorAngle;
    
    // Start spinning animation
    const spinDuration = 4000; // 4 seconds
    const spins = 6; // number of full rotations
    const startRotation = rotation;
    // Calculate end rotation: multiple spins + angle to target sector
    // Add offset so pointer (at top) points to the sector
    const pointerOffset = 90; // pointer is at top (90 degrees from right)
    const endRotation = startRotation + (spins * 360) + (360 - targetAngle) + pointerOffset;
    
    // Animate rotation
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (endRotation - startRotation) * easeOut;
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation finished
        setSelectedIndex(randomIndex);
        setOutcome(result);
        setSpinning(false);
        
        // If user won a discount and is logged in, save it to backend
        if (result.type === "discount") {
          const token = localStorage.getItem("token");
          if (token) {
            setSavingDiscount(true);
            saveDiscount(result.value)
              .then((savedData) => {
                if (savedData && savedData.discountCode) {
                  setOutcome({
                    ...result,
                    discountCode: savedData.discountCode,
                    message: `You won ${result.value}% off! Use code: ${savedData.discountCode}`
                  });
                }
                setSavingDiscount(false);
              })
              .catch((err) => {
                console.error("Failed to save discount:", err);
                setSavingDiscount(false);
                // Still show the discount, just not saved
              });
          }
        }
      }
    };
    animate();
  };

  const renderWheelSectors = () => {
    const sectorAngle = 360 / sectors.length;
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
      "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", 
      "#F8B739", "#95A5A6", "#FF8C94", "#52C9DC"
    ];
    
    return sectors.map((sector, index) => {
      const angle = index * sectorAngle;
      const color = colors[index % colors.length];
      const isSelected = selectedIndex === index && !spinning;
      
      // Adjust font size based on number of sectors
      const fontSize = sectors.length > 8 ? "0.8rem" : "0.9rem";
      
      return (
        <div
          key={index}
          style={{
            position: "absolute",
            width: "50%",
            height: "50%",
            top: "50%",
            left: "50%",
            transformOrigin: "0 0",
            transform: `rotate(${angle}deg)`,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: isSelected ? "#FFD700" : color,
            border: isSelected ? "4px solid #FFA500" : "1px solid rgba(255,255,255,0.4)",
            transition: isSelected ? "all 0.3s" : "none",
            zIndex: isSelected ? 5 : 1,
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "20%",
              transform: `rotate(${sectorAngle / 2}deg)`,
              transformOrigin: "0 0",
              fontSize: fontSize,
              fontWeight: 700,
              color: "#fff",
              textShadow: "2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              maxWidth: "70px",
              overflow: "visible",
              lineHeight: "1.2"
            }}
          >
            {sector.type === "discount" ? `${sector.value}%` : sector.label.length > 8 ? sector.label.substring(0, 8) : sector.label}
          </div>
        </div>
      );
    });
  };

  const renderCenter = () => {
    if (spinning) return <span style={{fontSize:"1.5rem"}}>🎡</span>;
    if (!outcome) return <span style={{fontSize:"1.5rem"}}>🎡</span>;
    switch (outcome.type) {
      case "discount":
        return <span style={{fontSize:"2.2rem", fontWeight:700, color:"#FFD700"}}>{outcome.value}%</span>;
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
    if (error) {
      return (
        <div style={{ marginTop: 20, padding: "15px", background: "#fee2e2", borderRadius: "8px", border: "1px solid #fca5a5" }}>
          <p style={{ margin: 0, color: "#dc2626", fontWeight: 600 }}>{error}</p>
          <button
            onClick={handleRetry}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    if (!outcome) return null;

    switch (outcome.type) {
      case "discount":
        return (
          <div style={{ marginTop: 18 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#059669" }}>{outcome.message}</p>
            {outcome.discountCode && (
              <p style={{ margin: "6px 0 0", color: "#475569", fontSize: "0.9rem" }}>
                Discount Code: <strong style={{ color: "#059669" }}>{outcome.discountCode}</strong>
              </p>
            )}
            {!outcome.discountCode && (
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Login to save your discount code!
              </p>
            )}
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
        position: "relative",
        width: "450px",
        height: "450px",
        margin: "40px auto"
      }}>
        {/* Pointer - fixed at top */}
        <div style={{
          position: "absolute",
          top: "-15px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderTop: "40px solid #ef4444",
          zIndex: 100,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))"
        }} />
        
        {/* Wheel container */}
        <div 
          ref={wheelRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "10px solid #1f2937",
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "none" : "transform 0.3s ease-out",
            background: "#f0f0f0"
          }}
        >
          {renderWheelSectors()}
        </div>
        
        {/* Center circle */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: "#fff",
          border: "8px solid #1f2937",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
        }}>
          {renderCenter()}
        </div>
      </div>

      <div>
        <button
          onClick={handleSpin}
          disabled={spinning}
          style={{
            padding: "14px 40px",
            fontSize: "1.1rem",
            cursor: spinning ? "not-allowed" : "pointer",
            background: spinning ? "#9ca3af" : "#f59e0b",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 700,
            boxShadow: spinning ? "none" : "0 4px 15px rgba(245, 158, 11, 0.4)",
            transition: "all 0.3s"
          }}
        >
          {spinning ? "Spinning..." : "SPIN THE WHEEL!"}
        </button>
      </div>
      
      <p style={{ marginTop: "20px", color: "#64748b", fontSize: "0.9rem" }}>
        {sectors.length} options available
      </p>
      
      {savingDiscount && (
        <p style={{ marginTop: "10px", color: "#059669", fontSize: "0.9rem" }}>
          Saving your discount...
        </p>
      )}

      {renderMessage()}
    </div>
  );
}

export default WheelPage;
