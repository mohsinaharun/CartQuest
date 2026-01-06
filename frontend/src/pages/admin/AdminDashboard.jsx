import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        // Mock stats or fetch real ones if endpoints existed
        // Let's fetch products and orders count roughly
        const fetchStats = async () => {
            try {
                // We'll reuse the public/admin APIs to get counts
                const productsRes = await api.get('/products');
                const productsCount = productsRes.data.total || 0;

                // For orders we need admin access
                const ordersRes = await api.get('/orders/admin/all');
                const orders = ordersRes.data || [];
                const revenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
                const pending = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'pending').length;

                setStats({
                    totalOrders: orders.length,
                    totalProducts: productsCount,
                    totalRevenue: revenue,
                    pendingOrders: pending
                });
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Total Products</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 transition text-left px-4 font-semibold flex justify-between items-center"
                        >
                            <span>Add New Product</span>
                            <span>→</span>
                        </button>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="w-full bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 transition text-left px-4 font-semibold flex justify-between items-center"
                        >
                            <span>Manage Recent Orders</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
