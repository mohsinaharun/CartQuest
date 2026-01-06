import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart } = useCart();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Hide Navbar completely on admin dashboard pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const cartCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/home" className="flex items-center gap-2">
                            <span className="text-2xl">🛍️</span>
                            <span className="font-bold text-xl tracking-tight text-slate-900">CartQuest</span>
                        </Link>
                    </div>

                    {/* Admin View: Simplified Header */}
                    {role === 'admin' ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Admin Mode
                            </span>
                            <Link
                                to="/admin/dashboard"
                                className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                Go to Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        /* Consumer View: Full Header */
                        <>
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/home" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                    Shop
                                </Link>
                                <Link to="/guess-price" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                    Guess Price
                                </Link>
                                <Link to="/spin" className="text-amber-500 hover:text-amber-600 font-bold transition-colors flex items-center gap-1">
                                    <span>🎁</span> Spin & Win
                                </Link>
                            </div>

                            {/* Right Side Icons */}
                            <div className="flex items-center gap-4">
                                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {token ? (
                                    <div className="flex items-center gap-4">
                                        <Link to="/profile" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                                            Profile
                                        </Link>
                                        <Link to="/orders" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                                            Orders
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
