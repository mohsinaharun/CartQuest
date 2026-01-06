import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setProducts(prodRes.data.data);
                setCategories(catRes.data); // Backend returns array directly
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load products');
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchFilteredProducts = async () => {
        setLoading(true);
        try {
            let url = '/products';
            const params = {};

            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }
            // Backend search not explicitly standard in checked code, 
            // but usually implemented via query or client-side filtering.
            // Let's do client-side filtering for search if backend doesn't support 'search' param yet, 
            // or simple re-fetch if we implemented backend filters.
            // Given backend code showed standard filtering, let's fetch all and filter client side for responsiveness 
            // OR fetch with params if backend supports it.
            // Let's assume backend `products.js` supports direct query params matching fields.

            const res = await api.get(url, { params });
            // Filter by search query client-side for smoother UX on small datasets
            let filtered = res.data.data;
            if (searchQuery) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setProducts(filtered);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce or simple effect for category switch
        fetchFilteredProducts();
    }, [activeCategory]);

    // Handle search on enter or button click
    const handleSearch = (e) => {
        e.preventDefault();
        fetchFilteredProducts();
    };

    if (loading && products.length === 0) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-20 px-6 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Elevate Your <span className="text-indigo-400">Style.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Discover the latest trends in fashion and technology. Quality products, unbeatable prices.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-full font-bold shadow-lg transition transform hover:scale-105">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setActiveCategory('All')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'All'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {Array.isArray(categories) && categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat._id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat._id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {error ? (
                    <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                <p className="text-gray-500 text-xl">No products found matching your criteria.</p>
                                <button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} className="mt-4 text-indigo-600 font-medium hover:underline">Clear Filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;
