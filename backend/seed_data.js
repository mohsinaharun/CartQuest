const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
    { name: 'Electronics', description: 'Gadgets, phones, and accessories', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500&q=80' },
    { name: 'Men\'s Fashion', description: 'Clothing and accessories for men', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=500&q=80' },
    { name: 'Women\'s Fashion', description: 'Trending styles for women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80' },
    { name: 'Footwear', description: 'Sneakers, boots, and formal shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
    { name: 'Home & Living', description: 'Decor, furniture, and daily essentials', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80' }
];

const products = [
    // Electronics
    { name: 'Wireless Noise Canceling Headphones', description: 'Premium sound with active noise cancellation.', basePrice: 299.99, categoryName: 'Electronics', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'], stock: 50, variants: [{ color: 'Black', size: 'OS', price: 299.99, stock: 25 }, { color: 'Silver', size: 'OS', price: 309.99, stock: 25 }] },
    { name: 'Smart Watch Series 7', description: 'Health tracking and notifications on your wrist.', basePrice: 399.00, categoryName: 'Electronics', images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'], stock: 30, variants: [{ color: 'Midnight', size: '41mm', price: 399.00, stock: 15 }, { color: 'Starlight', size: '45mm', price: 429.00, stock: 15 }] },
    { name: '4K Action Camera', description: 'Capture your adventures in stunning 4K resolution.', basePrice: 199.99, categoryName: 'Electronics', images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80'], stock: 40, variants: [{ color: 'Black', size: 'OS', price: 199.99, stock: 40 }] },
    { name: 'Bluetooth Speaker', description: 'Portable speaker with deep bass and 24h battery.', basePrice: 79.99, categoryName: 'Electronics', images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80'], stock: 60, variants: [{ color: 'Blue', size: 'OS', price: 79.99, stock: 30 }, { color: 'Red', size: 'OS', price: 79.99, stock: 30 }] },

    // Men's Fashion
    { name: 'Premium Cotton T-Shirt', description: '100% organic cotton, soft and breathable.', basePrice: 29.50, categoryName: 'Men\'s Fashion', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'], stock: 100, variants: [{ color: 'White', size: 'M', price: 29.50, stock: 50 }, { color: 'Black', size: 'L', price: 29.50, stock: 50 }] },
    { name: 'Slim Fit Denim Jeans', description: 'Classic denim with modern comfort stretch.', basePrice: 59.99, categoryName: 'Men\'s Fashion', images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80'], stock: 75, variants: [{ size: '32', color: 'Blue', price: 59.99, stock: 35 }, { size: '34', color: 'Blue', price: 59.99, stock: 40 }] },
    { name: 'Leather Wallet', description: 'Genuine leather wallet with RFID protection.', basePrice: 35.00, categoryName: 'Men\'s Fashion', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80'], stock: 50, variants: [{ color: 'Brown', size: 'OS', price: 35.00, stock: 25 }, { color: 'Black', size: 'OS', price: 35.00, stock: 25 }] },
    { name: 'Casual Hoodie', description: 'Warm and comfortable hoodie for everyday wear.', basePrice: 45.99, categoryName: 'Men\'s Fashion', images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80'], stock: 60, variants: [{ color: 'Grey', size: 'L', price: 45.99, stock: 30 }, { color: 'Navy', size: 'M', price: 45.99, stock: 30 }] },

    // Women's Fashion
    { name: 'Floral Summer Dress', description: 'Lightweight and breezy dress for summer.', basePrice: 49.99, categoryName: 'Women\'s Fashion', images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80'], stock: 40, variants: [{ size: 'S', color: 'Red', price: 49.99, stock: 20 }, { size: 'M', color: 'Red', price: 49.99, stock: 20 }] },
    { name: 'Designer Handbag', description: 'Elegant handbag for any occasion.', basePrice: 129.99, categoryName: 'Women\'s Fashion', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80'], stock: 20, variants: [{ color: 'Beige', size: 'OS', price: 129.99, stock: 10 }, { color: 'Black', size: 'OS', price: 129.99, stock: 10 }] },
    { name: 'Gold Necklace', description: 'Delicate gold chain with minimal pendant.', basePrice: 89.99, categoryName: 'Women\'s Fashion', images: ['https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500&q=80'], stock: 30, variants: [{ color: 'Gold', size: '18in', price: 89.99, stock: 30 }] },

    // Footwear
    { name: 'Nike Air Jordan 1', description: 'Iconic basketball shoes with premium cushioning.', basePrice: 150.00, categoryName: 'Footwear', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'], stock: 15, variants: [{ size: '9', color: 'Red/White', price: 150.00, stock: 5 }, { size: '10', color: 'Red/White', price: 150.00, stock: 10 }] },
    { name: 'Classic Leather Boots', description: 'Durable boots that get better with age.', basePrice: 120.00, categoryName: 'Footwear', images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80'], stock: 25, variants: [{ size: '9', color: 'Brown', price: 120.00, stock: 15 }, { size: '10', color: 'Brown', price: 120.00, stock: 10 }] },
    { name: 'Running Shoes', description: 'Lightweight mesh shoes for running and training.', basePrice: 85.00, categoryName: 'Footwear', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'], stock: 100, variants: [{ size: '10', color: 'Blue', price: 85.00, stock: 50 }, { size: '11', color: 'Black', price: 85.00, stock: 50 }] },

    // Home & Living
    { name: 'Ceramic Plant Pot', description: 'Minimalist ceramic pot for indoor plants.', basePrice: 24.99, categoryName: 'Home & Living', images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80'], stock: 50, variants: [{ color: 'White', size: 'Medium', price: 24.99, stock: 50 }] },
    { name: 'Scented Candle', description: 'Lavender scented soy wax candle.', basePrice: 18.00, categoryName: 'Home & Living', images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80'], stock: 100, variants: [{ color: 'Purple', size: '10oz', price: 18.00, stock: 100 }] },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🔌 Connected to Cloud DB for Extended Seeding...");

        console.log("🧹 Clearing old data...");
        try {
            await Category.collection.drop();
            await Product.collection.drop();
            console.log("   - Collections dropped.");
        } catch (e) { }

        console.log("📂 Seeding Categories...");
        const categoriesWithSlugs = categories.map(c => ({
            ...c,
            slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }));
        const createdCategories = await Category.insertMany(categoriesWithSlugs);
        console.log(`   - Added ${createdCategories.length} categories.`);

        console.log("📦 Seeding Products...");
        const productDocs = products.map((p, pIndex) => {
            const cat = createdCategories.find(c => c.name === p.categoryName);
            return {
                ...p,
                category: cat ? cat._id : null,
                variants: (p.variants || []).map((v, vIndex) => ({
                    ...v,
                    sku: `SKU-${pIndex}-${vIndex}-${Date.now()}`
                }))
            };
        });

        const createdProducts = await Product.insertMany(productDocs);
        console.log(`   - Added ${createdProducts.length} products.`);
        console.log("✅ Seeding Complete!");

    } catch (err) {
        console.error("❌ Seeding Failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected.");
    }
};

seedDB();
