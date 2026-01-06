import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);

    // Fetch cart on mount (if user is logged in)
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // Cart is server-side only for now

        setLoading(true);
        try {
            const res = await api.get('/cart');
            setCart({ items: res.data.items || [], total: res.data.totalAmount || 0 });
        } catch (err) {
            console.error("Error fetching cart:", err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, variant, quantity = 1) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to add to cart");
            return;
        }

        try {
            setLoading(true);
            await api.post('/cart/add', {
                productId: product._id,
                variant: variant,
                quantity
            });
            await fetchCart(); // Refresh cart
            alert("Added to cart!");
        } catch (err) {
            console.error("Add to cart error:", err);
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);
            await api.delete(`/cart/remove/${itemId}`);
            await fetchCart();
        } catch (err) {
            console.error("Remove from cart error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQty) => {
        if (newQty < 1) return;
        try {
            setLoading(true);
            await api.put('/cart/update', { itemId, quantity: newQty });
            await fetchCart();
        } catch (err) {
            console.error("Update qty error:", err);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            await api.delete('/cart/clear');
            setCart({ items: [], total: 0 });
        } catch (err) {
            console.error(err);
        }
    };

    const applyCoupon = async (code) => {
        try {
            setLoading(true);
            const res = await api.post('/cart/coupon', { code });
            setCart({
                items: res.data.items || [],
                total: res.data.totalAmount || 0,
                appliedCoupon: res.data.appliedCoupon
            });
            return { success: true, message: 'Coupon applied!' };
        } catch (err) {
            console.error("Coupon error:", err);
            return { success: false, message: err.response?.data?.message || 'Failed to apply coupon' };
        } finally {
            setLoading(false);
        }
    };

    const removeCoupon = async () => {
        try {
            setLoading(true);
            const res = await api.delete('/cart/coupon');
            setCart({
                items: res.data.items || [],
                total: res.data.totalAmount || 0,
                appliedCoupon: undefined
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon }}>
            {children}
        </CartContext.Provider>
    );
};
