import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateDeduction } from '../../utils/deduction';

export default function DeductionGrid({ onComplete, initialLevel = 1 }) {
    // 1. Sync local state with parent prop for instant level-up
    const [level, setLevel] = useState(initialLevel);
    const [data, setData] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [status, setStatus] = useState('playing');

    // --- GAME INITIALIZATION ---
    useEffect(() => {
        setLevel(initialLevel);
        const newData = generateDeduction(initialLevel);
        setData(newData);

        // Clear previous board state
        const initial = {};
        newData.people.forEach(p => initial[p] = null);
        setAssignments(initial);
        setStatus('playing');
    }, [initialLevel]);

    const handleAssign = (person, item) => {
        if (status !== 'playing') return;

        setAssignments(prev => {
            const newObj = { ...prev };
            // If someone else had this item, clear it (Exclusive assignment)
            Object.keys(newObj).forEach(key => {
                if (newObj[key] === item) newObj[key] = null;
            });
            // Toggle off if clicking same item, otherwise assign
            if (prev[person] === item) newObj[person] = null;
            else newObj[person] = item;

            return newObj;
        });
    };

    const checkSolution = () => {
        const isFull = Object.values(assignments).every(v => v !== null);
        if (!isFull) return;

        let correct = true;
        Object.keys(data.solution).forEach(p => {
            if (assignments[p] !== data.solution[p]) correct = false;
        });

        if (correct) {
            setStatus('won');
            confetti({ particleCount: 100, spread: 70 });

            // AUTO-PROCEED: Signal success to App.jsx for instant level-up or menu exit
            setTimeout(() => {
                if (onComplete) {
                    onComplete(true);
                }
            }, 1500);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('playing'), 1000);
        }
    };

    if (!data) return <div className="text-red-500 font-mono animate-pulse text-center mt-20">GENERATING CASE...</div>;

    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 select-none">

            {/* HEADER HUD */}
            <div className="mb-8 text-center w-full border-b border-red-900/30 pb-4">
                <h2 className="text-3xl font-bold text-red-500 tracking-tighter uppercase">Sherlock Grid</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    Puzzle #{1000 + level} • Level {level} • {data.people.length} Suspects
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 w-full items-start">

                {/* LEFT COLUMN: THE NARRATIVE (CLUES) */}
                <div className="bg-[#120f0f] p-6 rounded-xl border border-red-900/20 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600/30"></div>
                    <h3 className="text-red-500 font-bold text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
                        <span>🔍</span> Clue Evidence
                    </h3>

                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-slate-400 font-serif leading-7 text-justify opacity-90 first-letter:text-4xl first-letter:text-red-600 first-letter:mr-2 first-letter:float-left">
                            {data.story}
                        </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-red-900/10 text-[9px] text-red-900 font-mono uppercase tracking-widest">
                        Evidence strictly confidential
                    </div>
                </div>

                {/* RIGHT COLUMN: THE INTERACTIVE BOARD */}
                <div className="flex flex-col gap-3">
                    {data.people.map(person => (
                        <motion.div
                            key={person}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border transition-all duration-300
                                ${assignments[person] ? 'bg-slate-800/50 border-red-900/40' : 'bg-slate-900/50 border-slate-800'}
                            `}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-lg border border-slate-700">👤</div>
                                <span className="font-bold text-slate-200">{person}</span>
                                {assignments[person] && (
                                    <motion.span
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-900/30 font-mono uppercase"
                                    >
                                        Linked: {assignments[person]}
                                    </motion.span>
                                )}
                            </div>

                            {/* ITEM SELECTION GRID */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {data.objects.map(item => {
                                    const isSelected = assignments[person] === item;
                                    const isTakenByOther = Object.keys(assignments).some(p => p !== person && assignments[p] === item);

                                    return (
                                        <button
                                            key={item}
                                            onClick={() => handleAssign(person, item)}
                                            disabled={isTakenByOther && !isSelected}
                                            className={`
                                                px-2 py-2 rounded text-[10px] font-mono border transition-all truncate uppercase
                                                ${isSelected
                                                    ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-900/20'
                                                    : isTakenByOther
                                                        ? 'bg-slate-950 text-slate-800 border-transparent opacity-30 line-through'
                                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-red-900/50 hover:text-slate-200'}
                                            `}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}

                    {/* ACTION BUTTON */}
                    <button
                        onClick={checkSolution}
                        className={`mt-4 w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-2xl
                            ${status === 'error' ? 'bg-red-900 text-red-200 animate-shake border border-red-700' :
                                status === 'won' ? 'bg-green-600 text-white border border-green-500' :
                                    'bg-slate-100 text-slate-900 hover:bg-white'}
                        `}
                    >
                        {status === 'error' ? 'Logic Mismatch' : status === 'won' ? 'Case Closed' : 'Verify Findings'}
                    </button>
                </div>

            </div>
        </div>
    );
}