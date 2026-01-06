import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import AddressSelector from '../components/AddressSelector';
import PaymentMethod from '../components/PaymentMethod';
import OrderSummary from '../components/OrderSummary';

const CheckoutPage = () => {
    const { cart, fetchCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            setAddresses(res.data);
            const defaultAddr = res.data.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddress(defaultAddr._id);
            else if (res.data.length > 0) setSelectedAddress(res.data[0]._id);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select an address');
            return;
        }

        setLoading(true);
        try {
            // Prepare items payload matching backend Order schema
            const orderItems = cart.items.map(item => ({
                productId: item.product._id,
                name: item.product.name,
                image: item.product.images[0],
                variant: item.variant,
                quantity: item.quantity,
                price: item.price
            }));

            // Prepare total calculations
            const subtotal = cart.total;
            const shippingCost = 0;
            const discount = 0;

            const payload = {
                items: orderItems,
                deliveryAddressId: selectedAddress,
                paymentMethod: selectedPayment,
                subtotal: subtotal,
                shippingCost: shippingCost,
                discount: discount
            };

            const res = await api.post('/orders', payload);

            await clearCart(); // Context clear
            navigate('/order-success');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    if (!cart.items.length) {
        return <div className="p-10 text-center">Your cart is empty. <br /><button onClick={() => navigate('/home')}>Go Shopping</button></div>;
    }

    // Logic for OrderSummary calculations
    const subtotal = cart.total;
    const shippingCost = 0; // Free for now
    const discount = 0; // Coins logic could go here
    const total = subtotal + shippingCost - discount;

    return (
        <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold mb-4">Checkout</h1>

                {/* Components using Tailwind (already styled) */}
                <AddressSelector
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSelectAddress={setSelectedAddress}
                    onRefresh={fetchAddresses}
                />

                <PaymentMethod
                    selectedMethod={selectedPayment}
                    onSelectMethod={setSelectedPayment}
                />
            </div>

            <div className="md:col-span-1">
                <OrderSummary
                    items={cart.items.map(item => ({
                        name: item.product.name,
                        image: item.product.images[0],
                        variant: item.variant,
                        quantity: item.quantity,
                        price: item.price
                    }))}
                    calculations={{ subtotal, shippingCost, discount, total }}
                    loading={loading}
                    onPlaceOrder={handlePlaceOrder}
                    selectedAddress={selectedAddress}
                />
            </div>
        </div>
    );
};

export default CheckoutPage;
