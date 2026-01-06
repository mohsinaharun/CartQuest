import { useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-2xl mx-auto p-10 text-center">
            <div className="mb-6 text-6xl">🎉</div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">
                Thank you for your purchase. You have earned points for this order!
                We will send you an email confirmation shortly.
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => navigate('/home')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
