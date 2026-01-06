import { useState } from "react";
import { spinWheel } from "../api/wheel";
import Confetti from 'react-canvas-confetti';

function WheelPage() {
  const [outcome, setOutcome] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const [fireConfetti, setFireConfetti] = useState(false);

  const handleSpin = async () => {
    setSpinning(true);
    setOutcome(null);
    setError(null);
    setFireConfetti(false);

    try {
      const res = await spinWheel();
      // Simulating a win for demo: (Removed)
      // const res = { outcome: { type: 'discount', value: 20, message: "Big Win!", label: "20% OFF" } };

      const result = res?.outcome ?? null;

      setTimeout(() => {
        setOutcome(result);
        setSpinning(false);
        if (result?.type === 'discount' || result?.type === 'virtual_hug') {
          setFireConfetti(true);
        }
      }, 2000); // Longer spin for suspense
    } catch (err) {
      setError("Failed to spin. Try again.");
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-indigo-900 to-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {fireConfetti && <Confetti style={{ position: 'fixed', width: '100%', height: '100%', zIndex: 100, pointerEvents: 'none' }} />}

      <div className="text-center z-10 mb-10">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
          Spin & Win!
        </h1>
        <p className="text-gray-300 text-lg">Test your luck to win exclusive discounts.</p>
      </div>

      <div className="relative">
        {/* Wheel Container */}
        <div className={`w-80 h-80 rounded-full border-8 border-amber-400 bg-white flex items-center justify-center relative shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-transform duration-[2000ms] ease-out ${spinning ? 'rotate-[1080deg]' : ''}`}>

          {/* Simple visual wheel segments */}
          <div className="absolute w-full h-full rounded-full overflow-hidden opacity-20">
            <div className="w-1/2 h-full bg-red-500 absolute left-0"></div>
            <div className="w-full h-1/2 bg-blue-500 absolute top-0"></div>
          </div>

          <div className="z-10 text-4xl">
            {spinning ? '🎡' : (outcome ? (outcome.type === 'discount' ? '🎉' : '🎁') : '🎰')}
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl text-red-500 z-20">
          ▼
        </div>
      </div>

      <div className="mt-12 h-32 text-center">
        {spinning ? (
          <p className="text-2xl font-bold animate-pulse text-yellow-300">Spinning...</p>
        ) : outcome ? (
          <div className="animate-bounce">
            <h2 className="text-3xl font-bold text-white mb-2">{outcome.message}</h2>
            {outcome.type === 'discount' && (
              <div className="bg-white text-indigo-900 px-6 py-2 rounded-lg inline-block font-mono text-xl font-bold border-2 border-dashed border-indigo-500">
                Code: {outcome.code || `SAVE${outcome.value}`}
              </div>
            )}
            <button
              onClick={handleSpin}
              className="block mx-auto mt-6 text-sm text-gray-400 hover:text-white underline"
            >
              Spin Again
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all"
          >
            SPIN NOW
          </button>
        )}
      </div>
    </div>
  );
}

export default WheelPage;
