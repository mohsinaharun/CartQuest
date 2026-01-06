import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={product.images[0] || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {product.discount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount}%
                    </span>
                )}
            </div>

            <div className="p-5">
                <p className="text-sm text-indigo-600 font-medium mb-1">
                    {product.category?.name || 'New Arrival'}
                </p>
                <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-slate-900">${product.basePrice}</span>
                    <Link
                        to={`/product/${product._id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                        View Details <span>→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
