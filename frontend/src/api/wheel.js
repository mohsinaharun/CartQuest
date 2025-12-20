const API_URL = "http://localhost:5000/api/wheel";

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

export const getDiscounts = async () => {
  try {
    console.log("Fetching from:", API_URL);
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    console.log("Response status:", res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("Received data:", data);
    return data;
  } catch (err) {
    console.error("Error fetching discounts:", err);
    // Provide more specific error message
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      throw new Error("Failed to fetch - Check if backend is running on http://localhost:5000");
    }
    throw err;
  }
};

// Save discount to backend when user wins
export const saveDiscount = async (discountValue) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
  
  try {
    const res = await fetch(`${API_URL}/save-discount`, {
      method: "POST",
      headers,
      body: JSON.stringify({ discountValue })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Failed to save discount" }));
      throw new Error(errorData.message || "Failed to save discount");
    }
    
    return await res.json();
  } catch (err) {
    console.error("Error saving discount:", err);
    throw err;
  }
};

export const getMyDiscounts = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  const res = await fetch(`${API_URL}/my-discounts`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return res.json();
};