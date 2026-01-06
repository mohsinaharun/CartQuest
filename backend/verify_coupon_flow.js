const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const verifyCoupon = async () => {
    try {
        console.log("1. Registering User...");
        const email = `couponuser${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/register`, {
            name: 'Coupon Tester',
            email,
            password: 'password123'
        });
        console.log("   - User registered.");

        console.log("1b. Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        console.log("   - Logged in.");

        console.log("2. Spinning Wheel until Win...");
        let couponCode = null;
        for (let i = 0; i < 20; i++) {
            const spinRes = await axios.post(`${API_URL}/wheel/spin`, {}, config);
            if (spinRes.data.outcome.type === 'discount') {
                couponCode = spinRes.data.outcome.code;
                console.log(`   - WON! Code: ${couponCode} (${spinRes.data.outcome.value}% off)`);
                break;
            }
        }

        if (!couponCode) {
            console.log("   - Didn't win in 20 spins. Aborting test (bad luck!).");
            return;
        }

        console.log("3. Adding Item to Cart...");
        const products = await axios.get(`${API_URL}/products`);
        const product = products.data.data[0];

        await axios.post(`${API_URL}/cart/add`, {
            productId: product._id,
            quantity: 1,
            variant: product.variants[0]
        }, config);
        console.log("   - Item added.");

        console.log("4. Applying Coupon...");
        const cartRes = await axios.post(`${API_URL}/cart/coupon`, { code: couponCode }, config);

        console.log("5. Verifying Discount...");
        console.log("   - Applied Coupon:", cartRes.data.appliedCoupon);
        console.log("   - Total Amount:", cartRes.data.totalAmount);

        if (cartRes.data.appliedCoupon && cartRes.data.appliedCoupon.code === couponCode) {
            console.log("✅ SUCCESS: Coupon applied and total updated!");
        } else {
            console.error("❌ FAILURE: Coupon not applied.");
        }

    } catch (err) {
        console.error("❌ Error:", err.response ? err.response.data : err.message);
    }
};

verifyCoupon();
