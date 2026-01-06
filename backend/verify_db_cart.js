const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Cart = require('./models/Cart');
const Product = require('./models/Product');

const verifyDB = async () => {
    try {
        console.log("🔌 Connecting to MongoDB:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        console.log("\n--- 👤 USERS ---");
        const users = await User.find();
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`));

        console.log("\n--- 🛒 CARTS ---");
        const carts = await Cart.find().populate('user', 'name email').populate('items.product', 'name');
        console.log(`Found ${carts.length} carts.`);

        carts.forEach(c => {
            console.log(`\nCart for User: ${c.user ? c.user.name : 'Unknown'} (${c.user ? c.user.email : 'No Email'})`);
            console.log(`Cart ID: ${c._id}`);
            console.log(`Items: ${c.items.length}`);
            c.items.forEach(item => {
                const productName = item.product ? item.product.name : 'Unknown Product';
                console.log(`   - ${productName} (Qty: ${item.quantity}) Price: $${item.price}`);
            });
        });

        if (carts.length === 0) {
            console.log("⚠️ No carts found. Try adding an item to the cart in the browser first.");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected.");
    }
};

verifyDB();
