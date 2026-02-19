import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { generateSudoku } from '../../utils/sudoku';

export default function Sudoku({ onComplete, initialLevel = 1 }) {
    // Synchronize local level with the prop from App.jsx
    const [level, setLevel] = useState(initialLevel);
    const [puzzleData, setPuzzleData] = useState(null);
    const [board, setBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState([0, 0]);
    const [mistakes, setMistakes] = useState(0);
    const [isLevelComplete, setIsLevelComplete] = useState(false);

    // --- 1. KEYBOARD CONTROLS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLevelComplete || !puzzleData) return;

            // Number Inputs (1 to maxNum)
            if (e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const num = parseInt(e.key);
                if (num <= puzzleData.maxNum) handleInput(num);
            }
            // Clear Cell
            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                handleInput(0);
            }
            // Arrow Navigation
            const [r, c] = selectedCell;
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                if (e.key === 'ArrowUp') setSelectedCell([Math.max(0, r - 1), c]);
                if (e.key === 'ArrowDown') setSelectedCell([Math.min(puzzleData.rows - 1, r + 1), c]);
                if (e.key === 'ArrowLeft') setSelectedCell([r, Math.max(0, c - 1)]);
                if (e.key === 'ArrowRight') setSelectedCell([r, Math.min(puzzleData.cols - 1, c + 1)]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, puzzleData, isLevelComplete, board]);

    // --- 2. GAME INITIALIZATION ---
    useEffect(() => {
        // Update local state when initialLevel changes from parent
        setLevel(initialLevel);
        const data = generateSudoku(initialLevel);
        setPuzzleData(data);
        setBoard(data.initial.map(row => [...row]));
        setMistakes(0);
        setIsLevelComplete(false);
    }, [initialLevel]);

    // --- 3. INPUT LOGIC ---
    const handleInput = (num) => {
        if (!selectedCell || !puzzleData || isLevelComplete) return;
        const [r, c] = selectedCell;

        // Prevent editing fixed starting numbers
        if (puzzleData.initial[r][c] !== 0) return;

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = num;
        setBoard(newBoard);

        // Check for mistakes immediately
        if (num !== 0 && num !== puzzleData.solution[r][c]) {
            setMistakes(m => m + 1);
            return;
        }

        // Check Win Condition
        const isFull = newBoard.every(row => row.every(cell => cell !== 0));
        if (isFull && JSON.stringify(newBoard) === JSON.stringify(puzzleData.solution)) {
            confetti({ particleCount: 150, spread: 70 });
            setIsLevelComplete(true);

            // Signal success to App.jsx for instant level-up or exit
            setTimeout(() => {
                if (onComplete) {
                    onComplete(true);
                }
            }, 1200);
        }
    };

    if (!puzzleData) return <div className="text-cyan-500 font-mono animate-pulse text-center mt-20">GENERATING PUZZLE...</div>;

    const { rows, cols, maxNum } = puzzleData;

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 select-none">

            {/* HEADER / HUD */}
            <div className="flex justify-between w-full mb-6 items-end border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tighter uppercase">Sudoku</h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                        Level {level} • {rows}x{cols} Grid
                    </p>
                </div>
                <div className="text-right">
                    <div className={`font-mono font-bold text-xl ${mistakes >= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                        {mistakes}<span className="text-xs text-slate-600">/3</span>
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">Mistakes</div>
                </div>
            </div>

            {/* THE GRID */}
            <div
                className="bg-slate-700 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '2px',
                    width: '100%',
                    maxWidth: '450px',
                    aspectRatio: `${cols} / ${rows}`
                }}
            >
                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                        const isInitial = puzzleData.initial[rIndex][cIndex] !== 0;
                        const isSelected = selectedCell[0] === rIndex && selectedCell[1] === cIndex;
                        const isError = !isInitial && cell !== 0 && cell !== puzzleData.solution[rIndex][cIndex];
                        const isRelated = (rIndex === selectedCell[0]) || (cIndex === selectedCell[1]);

                        return (
                            <div
                                key={`${rIndex}-${cIndex}`}
                                onClick={() => !isLevelComplete && setSelectedCell([rIndex, cIndex])}
                                className={`
                                    flex items-center justify-center font-bold transition-all duration-75
                                    ${cols > 8 ? 'text-sm' : 'text-xl'} 
                                    ${isSelected ? 'bg-cyan-600 text-white z-20 scale-105' :
                                        isRelated ? 'bg-slate-800 text-slate-300' : 'bg-slate-950 text-slate-500'}
                                    ${isError ? 'bg-red-900 text-red-400' : ''}
                                    ${!isError && !isInitial && cell !== 0 ? 'text-cyan-400' : ''}
                                `}
                            >
                                {cell !== 0 ? cell : ''}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* MOBILE INPUT PAD */}
            {!isLevelComplete && (
                <div
                    className="mt-8 grid gap-2 w-full max-w-sm"
                    style={{ gridTemplateColumns: `repeat(${Math.min(5, maxNum + 1)}, 1fr)` }}
                >
                    {Array.from({ length: maxNum }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => handleInput(num)}
                            className="h-12 bg-slate-800 rounded border border-slate-700 text-cyan-500 font-bold active:bg-cyan-600 active:text-white transition-all"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => handleInput(0)}
                        className="h-12 bg-red-900/20 text-red-500 rounded border border-red-900/50 font-mono text-xs uppercase"
                    >
                        ⌫
                    </button>
                </div>
            )}

            {/* WIN STATUS */}
            {isLevelComplete && (
                <div className="mt-8 p-4 bg-green-900/20 border border-green-500/50 rounded-xl animate-bounce">
                    <p className="text-green-400 font-mono text-sm font-bold uppercase tracking-widest">
                        Level Clear! Saving Points...
                    </p>
                </div>
            )}

            <div className="mt-6 text-[10px] text-slate-600 font-mono uppercase tracking-widest text-center">
                Arrows to Navigate • Numbers to Input • Backspace to Delete
            </div>
        </div>
    );
}