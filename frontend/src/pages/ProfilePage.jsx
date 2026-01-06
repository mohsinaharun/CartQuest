import React from 'react';
import CoinBalance from '../components/CoinBalance';
import ReferralCode from '../components/ReferralCode';

const ProfilePage = () => {
    const user = { name: "Valued Customer" }; // In a real app we'd fetch this from auth context/api

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
                <p className="text-gray-500">Manage your account, rewards, and referrals.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Rewards Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Your Rewards</h2>
                    <CoinBalance />
                </div>

                {/* Referrals Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">Refer & Earn</h2>
                    <ReferralCode />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
