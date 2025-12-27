import React from 'react';

const OrderSummary = ({ items, calculations, loading, onPlaceOrder, selectedAddress }) => {
  const { subtotal, shippingCost, discount, total } = calculations;

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
      
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">No items in cart</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex gap-3 pb-3 border-b border-gray-100">
              <img 
                src={item.image || '/placeholder.jpg'} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800 line-clamp-2">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-gray-500">
                    {item.variant.size && `Size: ${item.variant.size}`}
                    {item.variant.color && ` | Color: ${item.variant.color}`}
                  </p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                  <span className="font-semibold text-gray-800">${item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="space-y-3 py-4 border-t border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">
            {shippingCost === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center py-4 border-t-2 border-gray-300">
        <span className="text-lg font-bold text-gray-800">Total</span>
        <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>
      
      <button
        onClick={onPlaceOrder}
        disabled={loading || items.length === 0 || !selectedAddress}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </button>
      
      {!selectedAddress && items.length > 0 && (
        <p className="text-xs text-red-600 mt-2 text-center">
          Please select a delivery address
        </p>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col gap-2 text-xs text-gray-600">
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Secure checkout
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Easy returns & refunds
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            24/7 customer support
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;