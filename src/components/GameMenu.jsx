import { motion } from 'framer-motion';

// Configure your games here
const games = [
    { id: 'sudoku', title: 'Sudoku Infinite', desc: 'Logic Grid', color: 'bg-blue-600', active: true },
    { id: 'pattern', title: 'Pattern Match', desc: 'Visual Memory', color: 'bg-purple-600', active: true },
    { id: 'sequence', title: 'Seq. Solver', desc: 'Math Logic', color: 'bg-green-600', active: true },
    { id: 'binary', title: 'Binary Gate', desc: 'Digital Logic', color: 'bg-orange-600', active: true },
    { id: 'deduct', title: 'Sherlock Grid', desc: 'Deduction', color: 'bg-red-600', active: true },
];

export default function GameMenu({ onSelectGame }) {
    return (
        <div className="w-full max-w-4xl">
            <div className="mb-4 flex items-center gap-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Select Puzzle</span>
                <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {games.map((game, index) => (
                    <motion.button
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => game.active && onSelectGame(game.id)}
                        className={`
              relative overflow-hidden p-6 rounded-2xl text-left border border-slate-800 group transition-all
              ${game.active ? 'hover:border-slate-600 hover:shadow-2xl hover:-translate-y-1 bg-slate-900/80' : 'opacity-50 cursor-not-allowed bg-slate-900/40'}
            `}
                    >
                        {/* Hover Gradient Effect */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${game.color}`}></div>

                        {/* Icon Box */}
                        <div className={`w-10 h-10 rounded-lg ${game.color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg`}>
                            {index + 1}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                            {game.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                            {game.desc}
                        </p>

                        {/* Lock Icon if inactive */}
                        {!game.active && (
                            <div className="absolute top-4 right-4 text-slate-600">🔒</div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}