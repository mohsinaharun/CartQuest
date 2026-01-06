import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CoinBalance = () => {
  const [balance, setBalance] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get(`/coins/balance`);
      setBalance(res.data.balance);
      setConfig(res.data.config);
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
    );
  }

  const dollarValue = config ? (balance / config.coinToDollarRatio).toFixed(2) : 0;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Your Mahi Coins</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold">{balance}</p>
            <span className="text-xl">🪙</span>
          </div>
          <p className="text-sm opacity-90 mt-1">≈ ${dollarValue} value</p>
        </div>

        <div className="text-right">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs opacity-90">Earn Rate</p>
            <p className="text-lg font-bold">
              {config?.coinsPerDollar || 10} coins
            </p>
            <p className="text-xs opacity-90">per $1</p>
          </div>
        </div>
      </div>

      {config && balance >= config.minCoinsForRedemption && (
        <div className="mt-4 bg-white bg-opacity-20 rounded p-2 text-center text-sm">
          🎉 You can redeem your coins for discounts!
        </div>
      )}
    </div>
  );
};

export default CoinBalance;