const API_URL = "http://localhost:5000/api/wheel";

export const getDiscounts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const spinWheel = async () => {
  const res = await fetch(`${API_URL}/spin`, { method: "POST" });
  return res.json();
};