import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data.data);
                if (res.data.data.variants && res.data.data.variants.length > 0) {
                    setSelectedVariant(res.data.data.variants[0]);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, selectedVariant, quantity);
    };

    const handleQuantityChange = (val) => {
        if (val < 1) return;
        setQuantity(val);
    };

    if (loading) return <div className="p-10 text-center">Loading details...</div>;
    if (!product) return <div className="p-10 text-center">Product not found</div>;

    const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
    const currentStock = selectedVariant ? selectedVariant.stock : (product.stock || 0);
    const availableAfterSelection = Math.max(0, currentStock - quantity);

    return (
        <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-10">
            <div className="product-image-section">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full rounded-lg shadow-lg"
                />
            </div>

            <div className="product-info-section">
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">${currentPrice}</h2>

                {/* Stock Display */}
                <div className={`mb-6 p-3 rounded-lg inline-block ${currentStock > 0
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    <span className="font-semibold">
                        {currentStock > 0 ? 'In Stock: ' : 'Out of Stock'}
                    </span>
                    <span>
                        {currentStock > 0
                            ? `${availableAfterSelection} available (${quantity} selected)`
                            : 'Check back later'}
                    </span>
                </div>

                {product.variants && product.variants.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Select Option:</h3>
                        <div className="flex gap-2">
                            {product.variants.map((v, idx) => {
                                const isOutOfStock = v.stock <= 0;
                                return (
                                    <button
                                        key={idx}
                                        disabled={isOutOfStock}
                                        className={`px-4 py-2 border rounded transition relative
                                            ${selectedVariant === v
                                                ? 'bg-gray-800 text-white border-gray-800'
                                                : isOutOfStock
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 decoration-slate-400'
                                                    : 'hover:bg-gray-100 text-gray-700 border-gray-300'
                                            }
                                        `}
                                        onClick={() => {
                                            if (!isOutOfStock) {
                                                setSelectedVariant(v);
                                                setQuantity(1); // Reset quantity when changing variant
                                            }
                                        }}
                                    >
                                        {v.size} / {v.color}
                                        {isOutOfStock && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">Sold Out</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Quantity:</h3>
                    <div className="flex items-center border w-32 rounded-lg overflow-hidden">
                        <button
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <div className="flex-1 text-center font-bold text-gray-800">
                            {quantity}
                        </div>
                        <button
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= currentStock}
                        >
                            +
                        </button>
                    </div>
                    {quantity >= currentStock && currentStock > 0 && (
                        <p className="text-xs text-orange-500 mt-1">Max stock reached</p>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className={`w-full py-3 rounded-lg font-semibold transition ${currentStock > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
