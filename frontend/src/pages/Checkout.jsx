import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddressSelector from '../components/AddressSelector';
import PaymentMethod from '../components/PaymentMethod';
import OrderSummary from '../components/OrderSummary';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAddresses();
    fetchCartItems();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
      
      const defaultAddr = res.data.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      } else if (res.data.length > 0) {
        setSelectedAddress(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses');
    }
  };

  const fetchCartItems = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const shippingCost = subtotal > 1000 ? 0 : 50;
    const discount = 0;
    return { 
      subtotal, 
      shippingCost, 
      discount,
      total: subtotal + shippingCost - discount 
    };
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const { subtotal, shippingCost, discount } = calculateTotal();
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          image: item.image,
          variant: item.variant || {},
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddressId: selectedAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        discount
      };

      const res = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const order = res.data;

      if (paymentMethod === 'stripe') {
        await handleStripePayment(order);
      } else if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(order);
      } else if (paymentMethod === 'cod') {
        localStorage.removeItem('cart');
        window.location.href = `/order-success/${order._id}`;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (order) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`${API_URL}/api/payment/create-payment-intent`, {
        amount: order.totalAmount,
        orderId: order._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const stripe = await stripePromise;
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.data.sessionId
      });
      
      if (error) {
        setError('Payment failed: ' + error.message);
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      setError('Payment processing failed');
    }
  };

  const handleRazorpayPayment = async (order) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`${API_URL}/api/payment/create-razorpay-order`, {
        amount: order.totalAmount,
        orderId: order._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'CartQuest',
        description: 'Order Payment',
        order_id: res.data.id,
        handler: async function(response) {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/payment/verify-razorpay-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (verifyRes.data.success) {
              localStorage.removeItem('cart');
              window.location.href = `/order-success/${order._id}`;
            }
          } catch (error) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', function(response) {
        setError('Payment failed');
      });
    } catch (error) {
      console.error('Razorpay payment error:', error);
      setError('Payment processing failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <AddressSelector
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelectAddress={setSelectedAddress}
              onRefresh={fetchAddresses}
            />
            
            <PaymentMethod
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>
          
          <div>
            <OrderSummary
              items={cartItems}
              calculations={calculateTotal()}
              loading={loading}
              onPlaceOrder={handlePlaceOrder}
              selectedAddress={selectedAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;