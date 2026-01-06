import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cart, loading, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    if (loading && cart.items.length === 0) {
        return <div className="p-10 text-center">Loading cart...</div>;
    }

    if (cart.items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-10 text-center">
                <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="mb-6 text-gray-600">Looks like you haven't added anything yet.</p>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="md:col-span-2 space-y-4">
                    {cart.items.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow flex gap-4 items-center">
                            <img
                                src={item.product?.images?.[0] || '/placeholder.png'}
                                alt={item.product?.name}
                                className="w-24 h-24 object-cover rounded"
                            />

                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {item.variant.size} / {item.variant.color}
                                </p>
                                <p className="font-bold text-gray-800 mt-1">${item.price}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center border rounded">
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        className="px-3 py-1 hover:bg-gray-100"
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="px-3">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="text-red-500 text-sm hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>${cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span>Shipping</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <hr className="my-4" />

                        {/* Coupon Section */}
                        <div className="mb-4">
                            {cart.appliedCoupon ? (
                                <div className="bg-green-50 text-green-700 p-2 rounded flex justify-between items-center text-sm">
                                    <span>Coupon <b>{cart.appliedCoupon.code}</b> applied! (-{cart.appliedCoupon.discount}%)</span>
                                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo Code"
                                        className="border rounded px-3 py-2 w-full text-sm"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button
                                        onClick={async () => {
                                            const res = await applyCoupon(couponCode);
                                            if (!res.success) alert(res.message);
                                            else setCouponCode('');
                                        }}
                                        className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-xl font-bold mb-6">
                            <span>Total</span>
                            <span>${cart.total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
