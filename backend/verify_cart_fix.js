const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const verifyCart = async () => {
    try {
        console.log("1. Registering new user...");
        const email = `testcart${Date.now()}@example.com`;
        const password = 'password123';

        await axios.post(`${API_URL}/auth/register`, {
            name: 'Cart Tester',
            email,
            password
        });

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.token;
        console.log("   - Token received");

        console.log("3. Fetching Products...");
        const productRes = await axios.get(`${API_URL}/products`);
        const product = productRes.data.data[0];

        if (!product) {
            console.error("❌ No products found in DB provided to add to cart");
            return;
        }
        console.log(`   - Found product: ${product.name} ($${product.basePrice})`);

        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        console.log("4. Adding to Cart...");
        const addRes = await axios.post(`${API_URL}/cart/add`, {
            productId: product._id,
            quantity: 2,
            variant: product.variants[0]
        }, config);

        console.log("5. Checking Response for totalAmount...");
        console.log("   - Cart Total Item Count:", addRes.data.items.length);
        console.log("   - Cart Total Amount:", addRes.data.totalAmount);

        if (addRes.data.totalAmount && addRes.data.totalAmount > 0) {
            console.log("✅ SUCCESS: Total Amount is present and calculated!");
        } else {
            console.error("❌ FAILURE: Total Amount is missing or 0");
        }

    } catch (err) {
        console.error("❌ Error:", err.response ? err.response.data : err.message);
    }
};

verifyCart();
