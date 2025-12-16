import React from 'react';

const PaymentMethod = ({ selectedMethod, onSelectMethod }) => {
  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Stripe',
      icon: '💳',
      color: 'blue'
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'UPI, Cards, Net Banking & More',
      icon: '📱',
      color: 'purple'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive',
      icon: '💵',
      color: 'green'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Method</h2>
      
      <div className="space-y-3">
        {paymentMethods.map(method => {
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl`}>
                    {method.icon}
                  </div>
                  
                  <div>
                    <p className="font-semibold text-gray-800">{method.name}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-5 h-5 text-blue-600"
                />
              </div>
              
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {method.id === 'stripe' && (
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Secure payment with SSL encryption
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Supports all major credit and debit cards
                      </p>
                    </div>
                  )}
                  
                  {method.id === 'razorpay' && (
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        UPI, Cards, Net Banking, Wallets
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Instant payment confirmation
                      </p>
                    </div>
                  )}
                  
                  {method.id === 'cod' && (
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Pay in cash when order is delivered
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-orange-600">⚠</span>
                        Additional charges may apply
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default PaymentMethod;