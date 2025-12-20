const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// Demo products with prices (20+ products)
const demoProducts = [
  { id: 1, name: "LV Socks - Green", type: "Green", image: "🧦", price: 1500 },
  { id: 2, name: "LV Socks - Black", type: "Black", image: "🧦", price: 1500 },
  { id: 3, name: "LV Socks - White", type: "White", image: "🧦", price: 1500 },
  { id: 4, name: "Nike Air Max Shoes", type: "Sports", image: "👟", price: 8500 },
  { id: 5, name: "Adidas T-Shirt", type: "Casual", image: "👕", price: 1200 },
  { id: 6, name: "Ray-Ban Sunglasses", type: "Accessories", image: "🕶️", price: 4500 },
  { id: 7, name: "Gucci Belt", type: "Leather", image: "👔", price: 12000 },
  { id: 8, name: "Apple AirPods Pro", type: "Electronics", image: "🎧", price: 25000 },
  { id: 9, name: "Samsung Galaxy Watch", type: "Smartwatch", image: "⌚", price: 18000 },
  { id: 10, name: "Levi's Jeans", type: "Denim", image: "👖", price: 3500 },
  { id: 11, name: "Puma Backpack", type: "Bag", image: "🎒", price: 2200 },
  { id: 12, name: "Rolex Watch", type: "Luxury", image: "⌚", price: 250000 },
  { id: 13, name: "Zara Dress", type: "Formal", image: "👗", price: 4500 },
  { id: 14, name: "H&M Hoodie", type: "Casual", image: "🧥", price: 1800 },
  { id: 15, name: "Chanel Perfume", type: "Fragrance", image: "💄", price: 8500 },
  { id: 16, name: "Michael Kors Handbag", type: "Bag", image: "👜", price: 15000 },
  { id: 17, name: "Tommy Hilfiger Polo", type: "Casual", image: "👔", price: 3200 },
  { id: 18, name: "Under Armour Cap", type: "Accessories", image: "🧢", price: 1200 },
  { id: 19, name: "Prada Wallet", type: "Leather", image: "👛", price: 18000 },
  { id: 20, name: "Versace Sunglasses", type: "Luxury", image: "🕶️", price: 22000 },
  { id: 21, name: "Calvin Klein Underwear", type: "Underwear", image: "👙", price: 1500 },
  { id: 22, name: "Diesel Jacket", type: "Outerwear", image: "🧥", price: 8500 },
  { id: 23, name: "Fossil Watch", type: "Accessories", image: "⌚", price: 5500 },
  { id: 24, name: "Gap Sweater", type: "Casual", image: "🧶", price: 2800 },
  { id: 25, name: "Coach Wallet", type: "Leather", image: "👛", price: 12000 }
];

// GET /api/guess/products - Get random product for guessing
router.get("/products", (req, res) => {
  // Select a random product
  const randomIndex = Math.floor(Math.random() * demoProducts.length);
  const product = demoProducts[randomIndex];
  
  console.log(`Serving product ${product.id}: ${product.name} (${demoProducts.length} total products available)`);
  
  // Return product without price
  res.json({
    product: {
      id: product.id,
      name: product.name,
      type: product.type || "",
      image: product.image
    }
  });
});

// POST /api/guess/validate - Validate guess and award points
router.post("/validate", authMiddleware, async (req, res) => {
  try {
    const { productId, guessedPrice } = req.body;
    
    if (!productId || guessedPrice === undefined) {
      return res.status(400).json({ message: "Product ID and guessed price are required" });
    }

    // Find the product
    const product = demoProducts.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const actualPrice = product.price;
    const difference = Math.abs(guessedPrice - actualPrice);
    const tolerance = 100; // Allow 100 taka difference

    // Check if guess is correct (within tolerance)
    const isCorrect = difference <= tolerance;
    
    const user = await User.findById(req.user._id);
    const currentPoints = user.points || 0;
    
    if (isCorrect) {
      // Award 10 points for correct guess
      const pointsAwarded = 10;
      user.points = currentPoints + pointsAwarded;
      await user.save();
      
      res.json({
        correct: true,
        message: "Congratulations! You guessed correctly!",
        actualPrice: actualPrice,
        pointsAwarded: pointsAwarded,
        newPointsTotal: user.points
      });
    } else {
      // Deduct 5 points for incorrect guess (but don't go below 0)
      const pointsDeducted = 5;
      user.points = Math.max(0, currentPoints - pointsDeducted);
      await user.save();
      
      res.json({
        correct: false,
        message: `Incorrect guess. The actual price is ${actualPrice} taka.`,
        actualPrice: actualPrice,
        yourGuess: guessedPrice,
        difference: difference,
        pointsDeducted: pointsDeducted,
        newPointsTotal: user.points
      });
    }
  } catch (err) {
    console.error("Validate guess error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/guess/points - Get user's current points
router.get("/points", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("points");
    res.json({ points: user.points || 0 });
  } catch (err) {
    console.error("Get points error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/guess/convert - Convert points to discount money (100 points = 1 taka)
router.post("/convert", authMiddleware, async (req, res) => {
  try {
    const { pointsToConvert } = req.body;
    
    if (!pointsToConvert || pointsToConvert < 100) {
      return res.status(400).json({ message: "Minimum 100 points required to convert" });
    }

    const user = await User.findById(req.user._id);
    const currentPoints = user.points || 0;
    
    if (currentPoints < pointsToConvert) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Calculate discount amount (100 points = 1 taka)
    const discountAmount = Math.floor(pointsToConvert / 100);
    const remainingPoints = currentPoints - (discountAmount * 100);

    // Update user points
    user.points = remainingPoints;
    await user.save();

    // Create discount code
    const Discount = require("../models/Discount");
    const generateDiscountCode = () => {
      const prefix = "POINTS";
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
      return `${prefix}${randomNum}`;
    };

    let discountCode;
    let isUnique = false;
    while (!isUnique) {
      discountCode = generateDiscountCode();
      const existing = await Discount.findOne({ discountCode });
      if (!existing) isUnique = true;
    }

    // Save discount
    const discount = new Discount({
      userId: user._id,
      discountValue: discountAmount,
      discountCode: discountCode
    });
    await discount.save();

    res.json({
      message: `Converted ${pointsToConvert} points to ${discountAmount} taka discount`,
      discountCode: discountCode,
      discountAmount: discountAmount,
      remainingPoints: remainingPoints
    });
  } catch (err) {
    console.error("Convert points error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

