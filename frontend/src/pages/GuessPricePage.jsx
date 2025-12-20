import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomProduct, validateGuess, getUserPoints, convertPointsToDiscount } from "../api/guess";

function GuessPricePage() {
  const [product, setProduct] = useState(null);
  const [guessedPrice, setGuessedPrice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [pointsToConvert, setPointsToConvert] = useState("");
  const [converting, setConverting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
    loadPoints();
  }, []);

  const loadProduct = async () => {
    try {
      const data = await getRandomProduct();
      console.log("Loaded product:", data.product);
      setProduct(data.product);
      setResult(null);
      setGuessedPrice("");
    } catch (err) {
      console.error("Failed to load product:", err);
      alert("Failed to load product. Please try again.");
    }
  };

  const loadPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await getUserPoints();
        setPoints(data.points || 0);
      }
    } catch (err) {
      console.error("Failed to load points:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guessedPrice || guessedPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

      setLoading(true);
    try {
      const response = await validateGuess(product.id, parseFloat(guessedPrice));
      setResult(response);
      // Update points whether correct or incorrect
      setPoints(response.newPointsTotal);
    } catch (err) {
      alert(err.message || "Failed to validate guess");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPoints = async () => {
    const pointsToConvertNum = parseInt(pointsToConvert);
    if (!pointsToConvertNum || pointsToConvertNum < 100) {
      alert("Minimum 100 points required to convert");
      return;
    }

    if (pointsToConvertNum > points) {
      alert("Insufficient points");
      return;
    }

    setConverting(true);
    try {
      const response = await convertPointsToDiscount(pointsToConvertNum);
      alert(`Success! Discount code: ${response.discountCode} (${response.discountAmount} taka)`);
      setPoints(response.remainingPoints);
      setPointsToConvert("");
    } catch (err) {
      alert(err.message || "Failed to convert points");
    } finally {
      setConverting(false);
    }
  };

  const token = localStorage.getItem("token");

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px 20px",
      fontFamily: "Inter, Arial, sans-serif",
      background: "linear-gradient(180deg, #eef2ff 0%, #f3f6fb 100%)"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", color: "#1f2937", marginBottom: "10px" }}>
            🎯 Guess the Price
          </h1>
          {token && (
            <div style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#f59e0b",
              borderRadius: "20px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem"
            }}>
              Your Points: {points}
            </div>
          )}
        </div>

        {!token && (
          <div style={{
            padding: "20px",
            background: "#fee2e2",
            borderRadius: "10px",
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <p style={{ color: "#dc2626", margin: 0 }}>
              Please login to play and earn points!
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Product Display */}
        {product && (
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "6rem", marginBottom: "20px" }}>
              {product.image}
            </div>
            <h2 style={{ fontSize: "2rem", color: "#1f2937", marginBottom: "10px" }}>
              {product.name}
            </h2>
            {product.type && (
              <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "10px", fontStyle: "italic" }}>
                Type: {product.type}
              </p>
            )}
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
              Can you guess the price?
            </p>

            {/* Guess Form */}
            {!result && (
              <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
                <div style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}>
                  <input
                    type="number"
                    value={guessedPrice}
                    onChange={(e) => setGuessedPrice(e.target.value)}
                    placeholder="Enter price (taka)"
                    disabled={loading || !token}
                    style={{
                      padding: "15px 20px",
                      fontSize: "1.1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "10px",
                      width: "250px",
                      outline: "none"
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || !token}
                    style={{
                      padding: "15px 30px",
                      fontSize: "1.1rem",
                      background: loading ? "#9ca3af" : "#f59e0b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: 700
                    }}
                  >
                    {loading ? "Checking..." : "Submit Guess"}
                  </button>
                </div>
              </form>
            )}

            {/* Result Display */}
            {result && (
              <div style={{
                marginTop: "30px",
                padding: "25px",
                background: result.correct ? "#d1fae5" : "#fee2e2",
                borderRadius: "15px",
                border: `2px solid ${result.correct ? "#10b981" : "#ef4444"}`
              }}>
                <h3 style={{
                  color: result.correct ? "#059669" : "#dc2626",
                  fontSize: "1.5rem",
                  marginBottom: "15px"
                }}>
                  {result.correct ? "🎉 Correct!" : "❌ Incorrect"}
                </h3>
                <p style={{ fontSize: "1.1rem", color: "#1f2937", marginBottom: "10px" }}>
                  {result.message}
                </p>
                {result.correct && (
                  <p style={{ fontSize: "1rem", color: "#059669", fontWeight: 700 }}>
                    +{result.pointsAwarded} points! Total: {result.newPointsTotal} points
                  </p>
                )}
                {!result.correct && (
                  <>
                    <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "8px" }}>
                      Your guess: {result.yourGuess} taka | Actual: {result.actualPrice} taka
                    </p>
                    {result.pointsDeducted && (
                      <p style={{ fontSize: "1rem", color: "#dc2626", fontWeight: 700 }}>
                        -{result.pointsDeducted} points! Total: {result.newPointsTotal} points
                      </p>
                    )}
                  </>
                )}
                <button
                  onClick={loadProduct}
                  style={{
                    marginTop: "20px",
                    padding: "12px 25px",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "1rem"
                  }}
                >
                  Try Another Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Points Conversion */}
        {token && points >= 100 && (
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: "1.5rem", color: "#1f2937", marginBottom: "15px" }}>
              💰 Convert Points to Discount
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              100 points = 1 taka discount
            </p>
            <div style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <input
                type="number"
                value={pointsToConvert}
                onChange={(e) => setPointsToConvert(e.target.value)}
                placeholder="Points (min 100)"
                min="100"
                step="100"
                style={{
                  padding: "12px 20px",
                  fontSize: "1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  width: "200px",
                  outline: "none"
                }}
              />
              <button
                onClick={handleConvertPoints}
                disabled={converting}
                style={{
                  padding: "12px 25px",
                  fontSize: "1rem",
                  background: converting ? "#9ca3af" : "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: converting ? "not-allowed" : "pointer",
                  fontWeight: 700
                }}
              >
                {converting ? "Converting..." : "Convert"}
              </button>
            </div>
            {pointsToConvert && parseInt(pointsToConvert) >= 100 && (
              <p style={{ marginTop: "15px", color: "#059669", fontSize: "0.9rem" }}>
                You'll get {Math.floor(parseInt(pointsToConvert) / 100)} taka discount
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuessPricePage;

