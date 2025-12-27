import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono font-bold text-gray-800">{order._id}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Delivery Address</h2>
            {order.deliveryAddress && (
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">{order.deliveryAddress.fullName}</p>
                <p className="text-sm">{order.deliveryAddress.phoneNumber}</p>
                <p className="text-sm">{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && (
                  <p className="text-sm">{order.deliveryAddress.addressLine2}</p>
                )}
                <p className="text-sm">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </p>
                <p className="text-sm">{order.deliveryAddress.country}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Payment Information</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span className="text-sm">Payment Method:</span>
                <span className="font-semibold capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Payment Status:</span>
                <span className={`font-semibold capitalize ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Order Status:</span>
                <span className="font-semibold capitalize text-blue-600">
                  {order.orderStatus}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm">Transaction ID:</span>
                  <span className="font-mono text-xs">{order.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm">Order Date:</span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                <img 
                  src={item.image || '/placeholder.jpg'} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-600">
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` | Color: ${item.variant.color}`}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                    <span className="font-semibold text-gray-800">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-medium">
                {order.shippingCost === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `$${order.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t-2 border-gray-300 text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/orders"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
          >
            View All Orders
          </Link>
          <Link 
            to="/"
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            📧 A confirmation email has been sent to your registered email address
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;