import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ReferralCode = () => {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      // Fetch referral code
      const codeRes = await api.get('/referrals/my-code');
      setReferralCode(codeRes.data.referralCode);

      // Fetch stats
      const statsRes = await api.get('/referrals/stats');
      setStats(statsRes.data);

      // Fetch referral list
      const referralsRes = await api.get('/referrals/my-referrals');
      setReferrals(referralsRes.data.referrals);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = (platform) => {
    const message = `Join CartQuest and get 50 Mahi Coins! Use my referral code: ${referralCode}`;
    const encodedMessage = encodeURIComponent(message);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      email: `mailto:?subject=Join CartQuest&body=${encodedMessage}`
    };

    window.open(urls[platform], '_blank');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-40 rounded-lg"></div>
        <div className="bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>

        <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm mb-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold tracking-wider">{referralCode}</span>
            <button
              onClick={copyToClipboard}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="text-sm opacity-90 mb-4">
          Share your code and earn 100 coins for each friend who signs up! They get 50 coins too! 🎉
        </p>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => shareReferral('whatsapp')}
            className="bg-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
          >
            📱 WhatsApp
          </button>
          <button
            onClick={() => shareReferral('facebook')}
            className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            📘 Facebook
          </button>
          <button
            onClick={() => shareReferral('twitter')}
            className="bg-blue-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition"
          >
            🐦 Twitter
          </button>
          <button
            onClick={() => shareReferral('email')}
            className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            ✉️ Email
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Successful Referrals</p>
            <p className="text-3xl font-bold text-purple-600">{stats.completedReferrals}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Referrals</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingReferrals}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Coins Earned</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalCoinsEarned}</p>
          </div>
        </div>
      )}

      {/* Referral List */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Your Referrals</h3>
          </div>

          <div className="divide-y">
            {referrals.map((referral) => (
              <div key={referral._id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {referral.referredUserId?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(referral.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-600 font-semibold">+100 coins</p>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCode;