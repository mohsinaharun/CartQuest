import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoinDiscountApplier = ({ onApplyDiscount, orderTotal }) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCoinBalance();
  }, []);

  const fetchCoinBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoinBalance(res.data.balance);
      setConfig(res.data.config);
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async (coins) => {
    if (!coins || coins < 0) {
      setDiscount(0);
      setError('');
      return;
    }

    if (config && coins < config.minCoinsForRedemption) {
      setDiscount(0);
      setError(`Minimum ${config.minCoinsForRedemption} coins required`);
      return;
    }

    if (coins > coinBalance) {
      setError('Insufficient coin balance');
      setDiscount(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/coins/calculate-discount`, 
        { coins },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const calculatedDiscount = res.data.discount;
      
      // Don't allow discount greater than order total
      if (calculatedDiscount > orderTotal) {
        setError(`Discount cannot exceed order total ($${orderTotal.toFixed(2)})`);
        setDiscount(0);
      } else {
        setDiscount(calculatedDiscount);
        setError('');
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
      setError('Failed to calculate discount');
    }
  };

  const handleCoinsChange = (value) => {
    const coins = parseInt(value) || 0;
    setCoinsToUse(coins);
    calculateDiscount(coins);
  };

  const handleUseMaxCoins = () => {
    // Calculate max coins that can be used (don't exceed order total)
    const maxDiscountInDollars = orderTotal;
    const maxCoinsForDiscount = Math.floor(maxDiscountInDollars * config.coinToDollarRatio);
    const maxCoins = Math.min(coinBalance, maxCoinsForDiscount);
    
    setCoinsToUse(maxCoins);
    calculateDiscount(maxCoins);
  };

  const handleApply = async () => {
    if (coinsToUse === 0) {
      setError('Please enter coins to use');
      return;
    }

    setApplying(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/coins/spend`, 
        { coins: coinsToUse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Pass discount to parent component
      onApplyDiscount(discount, coinsToUse);
      
      // Update balance
      setCoinBalance(prev => prev - coinsToUse);
      setCoinsToUse(0);
      setDiscount(0);
    } catch (error) {
      console.error('Error applying discount:', error);
      setError(error.response?.data?.message || 'Failed to apply discount');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
    );
  }

  if (coinBalance === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">You don't have any Mahi Coins yet</p>
        <p className="text-xs text-gray-500 mt-1">Earn coins by making purchases!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">Use Mahi Coins</p>
          <p className="text-sm text-gray-600">Balance: {coinBalance} coins 🪙</p>
        </div>
        {config && (
          <button
            onClick={handleUseMaxCoins}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Use Max
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="number"
            min="0"
            max={coinBalance}
            value={coinsToUse || ''}
            onChange={(e) => handleCoinsChange(e.target.value)}
            placeholder="Enter coins to use"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {config && (
            <p className="text-xs text-gray-500 mt-1">
              Min: {config.minCoinsForRedemption} coins | {config.coinToDollarRatio} coins = $1
            </p>
          )}
        </div>

        {discount > 0 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800">
              💰 You'll save ${discount.toFixed(2)}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={applying || coinsToUse === 0 || discount === 0 || error}
          className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {applying ? 'Applying...' : `Apply ${coinsToUse} Coins`}
        </button>
      </div>
    </div>
  );
};

export default CoinDiscountApplier;