import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading your orders...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't made any purchases.</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Order Placed</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                        <p className="text-sm font-medium text-slate-900">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                            ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-3 last:pb-0 first:pt-0 border-b last:border-0 border-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded bg-gray-100"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity}
                                                {item.variant?.size && ` • Size: ${item.variant.size}`}
                                            </p>
                                        </div>
                                        <p className="font-medium text-slate-900">${item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
