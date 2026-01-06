import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Verify admin role from token/localstorage
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Decode token or check stored user info (simplified)
        // Ideally we would hit an /auth/me endpoint 
        // For now we trust the login flow redirection, 
        // but in a real app check backend verify
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold text-indigo-400">Admin Panel</h1>
                    <p className="text-xs text-gray-400 mt-1">CartQuest Manager</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`block px-4 py-3 rounded transition ${isActive('/admin/dashboard') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-800'}`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`block px-4 py-3 rounded transition ${isActive('/admin/products') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-800'}`}
                    >
                        📦 Products
                    </Link>
                    <Link
                        to="/admin/orders"
                        className={`block px-4 py-3 rounded transition ${isActive('/admin/orders') ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-800'}`}
                    >
                        🚚 Orders
                    </Link>
                    <div className="border-t border-slate-700 my-4"></div>
                    <Link
                        to="/home"
                        className="block px-4 py-3 rounded text-gray-400 hover:bg-slate-800 hover:text-white"
                    >
                        🏠 View Site
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 transition"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">
                        {location.pathname.includes('products') ? 'Product Management' :
                            location.pathname.includes('orders') ? 'Order Management' : 'Dashboard Overview'}
                    </h2>
                    <div className="text-sm text-gray-500">Welcome, Admin</div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
