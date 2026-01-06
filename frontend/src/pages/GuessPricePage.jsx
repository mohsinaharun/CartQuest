import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const GuessPricePage = () => {
    const [product, setProduct] = useState(null);
    const [guess, setGuess] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);

    const fetchGame = async () => {
        setLoading(true);
        setResult(null);
        setGuess('');
        try {
            const res = await api.get('/game/guess-price/product');
            setProduct(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/game/guess-price/leaderboard');
            setLeaderboard(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGame();
        fetchLeaderboard();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guess) return;

        try {
            const res = await api.post('/game/guess-price/submit', {
                productId: product._id,
                guess: parseFloat(guess)
            });

            setResult(res.data);
            if (res.data.coinsEarned > 0) {
                setCoinsEarned(res.data.coinsEarned);
                fetchLeaderboard(); // Refresh scores
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading game...</div>;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full">
                <div className="bg-indigo-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">💰 Guess the Price</h1>
                    <p className="text-indigo-100">Guess correctly within 5% and win coins!</p>
                </div>

                {product && (
                    <div className="p-8">
                        <div className="relative aspect-square mb-6 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>

                        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">{product.name}</h3>
                        <p className="text-center text-gray-500 mb-8 line-clamp-2">{product.description}</p>

                        {!result ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Price Guess ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold text-center"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95"
                                >
                                    Submit Guess
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <h4 className="text-lg font-bold mb-1">
                                        {result.isCorrect ? '🎉 Correct!' : '❌ Missed it!'}
                                    </h4>
                                    <p className="text-sm">
                                        The actual price was <span className="font-bold">${result.actualPrice}</span>
                                    </p>
                                </div>

                                {result.isCorrect && (
                                    <div className="animate-bounce text-yellow-500 text-xl font-bold">
                                        +{coinsEarned} Coins Earned!
                                    </div>
                                )}

                                <button
                                    onClick={fetchGame}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Leaderboard Section */}
            <div className="max-w-lg w-full mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-amber-500 p-4 text-center">
                    <h3 className="text-xl font-bold text-white">🏆 Top Guessers</h3>
                </div>
                <div className="p-0">
                    {leaderboard.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">No scores yet. Be the first!</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">Rank</th>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase">Player</th>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase text-right">Coins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-500">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </td>
                                        <td className="p-3 font-medium text-gray-800">{user.name}</td>
                                        <td className="p-3 font-bold text-right text-amber-600">{user.coins}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuessPricePage;
