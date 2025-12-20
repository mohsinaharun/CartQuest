const API_URL = "http://localhost:5000/api/guess";

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

export const getRandomProduct = async () => {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }
  return res.json();
};

export const validateGuess = async (productId, guessedPrice) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ productId, guessedPrice })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to validate guess");
  }

  return res.json();
};

export const getUserPoints = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}/points`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch points");
  }

  return res.json();
};

export const convertPointsToDiscount = async (pointsToConvert) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ pointsToConvert })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to convert points");
  }

  return res.json();
};

