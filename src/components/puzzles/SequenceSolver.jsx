import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateSequence } from '../../utils/sequence';

export default function SequenceSolver({ onComplete, initialLevel = 1 }) {
    // Sync local level with parent prop for instant level-up
    const [level, setLevel] = useState(initialLevel);
    const [data, setData] = useState(null);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('playing');

    // --- GAME INITIALIZATION ---
    useEffect(() => {
        setLevel(initialLevel);
        const newData = generateSequence(initialLevel);
        setData(newData);
        setInput('');
        setStatus('playing');
    }, [initialLevel]);

    const handleInput = (num) => {
        if (input.length > 8) return;
        setInput(prev => prev + num);
    };

    const handleDelete = () => setInput(prev => prev.slice(0, -1));

    const handleSubmit = () => {
        if (parseInt(input) === data.answer) {
            confetti({ particleCount: 100, spread: 60 });
            setStatus('won');

            // AUTO-PROCEED: Signal success to App.jsx for instant level-up or exit
            setTimeout(() => {
                if (onComplete) {
                    onComplete(true);
                }
            }, 1200);
        } else {
            setStatus('error');
            setInput('');
            setTimeout(() => setStatus('playing'), 500);
        }
    };

    if (!data) return <div className="text-green-500 font-mono animate-pulse text-center mt-20">GENERATING SEQUENCE...</div>;

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 select-none">

            {/* HEADER HUD */}
            <div className="mb-8 text-center w-full border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-green-500 tracking-tighter uppercase">Sequence Solver</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    Level {level} • {data.type} Logic
                </p>
            </div>

            {/* Sequence Display */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10">
                {data.sequence.map((num, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-slate-900 rounded-xl text-slate-200 font-bold text-lg sm:text-xl shadow-lg border-b-4 border-slate-950 border-x border-t border-slate-800"
                    >
                        {num}
                    </motion.div>
                ))}

                {/* The Target Input Box */}
                <motion.div
                    animate={status === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    className={`
                        w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl font-bold text-lg sm:text-xl shadow-xl border-b-4 transition-colors
                        ${status === 'error' ? 'bg-red-900 border-red-950 text-red-400' :
                            status === 'won' ? 'bg-green-500 border-green-700 text-white' :
                                'bg-green-600/20 border-green-600 text-green-400 animate-pulse'}
                    `}
                >
                    {input || '?'}
                </motion.div>
            </div>

            {/* Controller / Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleInput(num)}
                        className="h-16 bg-slate-800 rounded-xl text-white font-bold text-xl hover:bg-slate-700 active:bg-slate-600 active:translate-y-1 transition-all shadow-md border-b-2 border-slate-950"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleDelete}
                    className="h-16 bg-slate-900 text-red-500 font-bold rounded-xl hover:bg-red-950/30 transition-colors border-b-2 border-slate-950"
                >
                    ⌫
                </button>
                <button
                    onClick={() => handleInput(0)}
                    className="h-16 bg-slate-800 text-white font-bold text-xl rounded-xl hover:bg-slate-700 border-b-2 border-slate-950"
                >
                    0
                </button>
                <button
                    onClick={handleSubmit}
                    className="h-16 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 active:bg-green-400 shadow-lg shadow-green-900/20 transition-all border-b-2 border-green-800"
                >
                    ➜
                </button>
            </div>

            {/* WIN STATUS MESSAGE */}
            {status === 'won' && (
                <div className="mt-8 text-green-400 font-mono text-sm font-bold uppercase tracking-widest animate-bounce">
                    Pattern Identified!
                </div>
            )}
        </div>
    );
}