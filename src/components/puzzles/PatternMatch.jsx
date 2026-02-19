import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generatePattern } from '../../utils/pattern';

export default function PatternMatch({ onComplete, initialLevel = 1 }) {
    // Sync local level with parent prop for instant level-up
    const [level, setLevel] = useState(initialLevel);
    const [gameData, setGameData] = useState(null);
    const [userClicks, setUserClicks] = useState([]);
    const [status, setStatus] = useState('showing'); // showing, playing, won, lost

    // --- GAME INITIALIZATION ---
    useEffect(() => {
        setLevel(initialLevel);
        startLevel(initialLevel);
    }, [initialLevel]);

    const startLevel = (currentLevel) => {
        const data = generatePattern(currentLevel);
        setGameData(data);
        setUserClicks([]);
        setStatus('showing');

        // Show time scales with difficulty (give 0.5s per tile)
        const showTime = 1000 + (data.targetPattern.length * 500);

        setTimeout(() => {
            setStatus('playing');
        }, showTime);
    };

    const handleTileClick = (index) => {
        if (status !== 'playing') return;

        if (gameData.targetPattern.includes(index)) {
            if (!userClicks.includes(index)) {
                const newClicks = [...userClicks, index];
                setUserClicks(newClicks);

                if (newClicks.length === gameData.targetPattern.length) {
                    setStatus('won');
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

                    // AUTO-PROCEED: Signal success to App.jsx for instant level-up or menu exit
                    setTimeout(() => {
                        if (onComplete) {
                            onComplete(true);
                        }
                    }, 1200);
                }
            }
        } else {
            setStatus('lost');
            setTimeout(() => {
                setUserClicks([]);
                setStatus('showing');
                setTimeout(() => setStatus('playing'), 1000);
            }, 1000);
        }
    };

    if (!gameData) return <div className="text-purple-500 font-mono animate-pulse text-center mt-20">GENERATING PATTERN...</div>;

    const { size } = gameData;

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 select-none">

            {/* HEADER HUD */}
            <div className="mb-8 text-center w-full border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-purple-400 tracking-tighter uppercase">Visual Memory</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                    Level {level} • {size}x{size} Grid • {gameData.targetPattern.length} Tiles
                </p>
            </div>

            {/* THE PATTERN GRID */}
            <div
                className="grid gap-2 bg-slate-900 p-3 rounded-xl shadow-2xl transition-all duration-500 border border-slate-800"
                style={{
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    width: '100%',
                    maxWidth: `${size * 70}px`,
                    aspectRatio: '1/1'
                }}
            >
                {Array.from({ length: size * size }).map((_, i) => {
                    const isTarget = gameData.targetPattern.includes(i);
                    const isSelected = userClicks.includes(i);
                    const isShowing = status === 'showing' && isTarget;

                    return (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTileClick(i)}
                            animate={
                                isShowing ? { scale: [1, 1.05, 1], backgroundColor: '#9333ea' } :
                                    isSelected ? { scale: 1, backgroundColor: '#22c55e' } :
                                        status === 'lost' && isSelected && !isTarget ? { x: [-5, 5, 0], backgroundColor: '#ef4444' } :
                                            { backgroundColor: '#1e293b' }
                            }
                            className={`
                                rounded-lg cursor-pointer transition-all duration-200
                                ${isShowing ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-800'}
                                ${isSelected ? '!bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}
                            `}
                        />
                    );
                })}
            </div>

            {/* GAME STATUS MESSAGES */}
            <div className="mt-8 h-8 text-sm font-bold font-mono tracking-widest uppercase">
                {status === 'showing' && <span className="text-purple-400 animate-pulse">Memorize...</span>}
                {status === 'playing' && <span className="text-slate-400">Recall Tiles</span>}
                {status === 'won' && <span className="text-green-400">Match Found!</span>}
                {status === 'lost' && <span className="text-red-500">Missed. Try Again...</span>}
            </div>
        </div>
    );
}