import React, { useState } from 'react';
import CoinBalance from '../components/CoinBalance';
import CoinTransactionHistory from '../components/CoinTransactionHistory';
import ReferralCode from '../components/ReferralCode';

const MahiCoins = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🪙' },
    { id: 'transactions', label: 'Transactions', icon: '📊' },
    { id: 'referrals', label: 'Referrals', icon: '👥' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mahi Coins</h1>
          <p className="text-gray-600">Earn coins with every purchase and referral. Redeem them for discounts!</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <CoinBalance />
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">How to Earn Coins</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-blue-100 rounded-lg p-4">
                    <div className="text-3xl mb-2">🛍️</div>
                    <h3 className="font-semibold text-gray-800 mb-1">Shop & Earn</h3>
                    <p className="text-sm text-gray-600">Earn 10 coins for every $1 you spend</p>
                  </div>
                  
                  <div className="border-2 border-purple-100 rounded-lg p-4">
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="font-semibold text-gray-800 mb-1">Refer Friends</h3>
                    <p className="text-sm text-gray-600">Get 100 coins when your friend signs up</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">How to Use Coins</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium text-gray-800">Redeem for Discounts</p>
                      <p className="text-sm text-gray-600">100 coins = $1 discount at checkout</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-medium text-gray-800">Minimum Redemption</p>
                      <p className="text-sm text-gray-600">You need at least 50 coins to redeem</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <CoinTransactionHistory />
          )}

          {activeTab === 'referrals' && (
            <ReferralCode />
          )}
        </div>
      </div>
    </div>
  );
};

export default MahiCoins;