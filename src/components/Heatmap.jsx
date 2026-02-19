import { useState } from 'react';
import { getTodayKey } from '../utils/progress';

export default function Heatmap({ history = [] }) {
    // 1. Defensively handle history. If history is undefined or null, default to empty array.
    const safeHistory = Array.isArray(history) ? history : [];

    // State to track the currently viewed month (defaults to Today)
    const [viewDate, setViewDate] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    // --- NAVIGATION ---
    const handlePrev = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNext = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isFutureMonth = () => {
        const today = new Date();
        return viewDate.getFullYear() > today.getFullYear() ||
            (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() >= today.getMonth());
    };

    // --- GRID GENERATION ---
    const generateDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Get number of days in this month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get which day of the week the 1st falls on (0 = Sunday)
        const firstDayIndex = new Date(year, month, 1).getDay();

        const cells = [];

        // 1. Padding for empty days at start
        for (let i = 0; i < firstDayIndex; i++) {
            cells.push({ type: 'empty', key: `empty-${i}` });
        }

        // 2. Actual Days
        for (let d = 1; d <= daysInMonth; d++) {
            // Format: YYYY-MM-DD (Manual construction to avoid timezone shifts)
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            cells.push({
                type: 'day',
                day: d,
                dateKey: dateKey,
                // USE safeHistory HERE TO PREVENT CRASH
                isActive: safeHistory.includes(dateKey),
                isToday: dateKey === getTodayKey()
            });
        }

        return cells;
    };

    const cells = generateDays();

    return (
        <div className="w-full bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">

            {/* HEADER: Month + Navigation */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold tracking-wide">
                        {monthNames[viewDate.getMonth()]} <span className="text-slate-500">{viewDate.getFullYear()}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ACTIVITY LOG</p>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={handlePrev}
                        className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isFutureMonth()}
                        className={`w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 transition-colors
              ${isFutureMonth() ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:bg-slate-700'}
            `}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">

                {/* Weekday Headers */}
                {weekDays.map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-slate-600 mb-2">
                        {d}
                    </div>
                ))}

                {/* Days */}
                {cells.map((cell) => {
                    if (cell.type === 'empty') {
                        return <div key={cell.key} className="w-full aspect-square" />;
                    }

                    return (
                        <div
                            key={cell.dateKey}
                            title={cell.dateKey}
                            className={`
                w-full aspect-square rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all
                ${cell.isActive
                                    ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)] border border-green-500'
                                    : 'bg-slate-800/40 text-slate-600 border border-transparent'}
                
                ${cell.isToday ? 'ring-2 ring-yellow-400 z-10 scale-110' : ''}
              `}
                        >
                            {cell.day}
                        </div>
                    );
                })}
            </div>

            {/* FOOTER STATS */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        <span className="text-slate-400">Played</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-800 border border-yellow-400"></div>
                        <span className="text-slate-400">Today</span>
                    </div>
                </div>
                <div className="text-slate-500">
                    {safeHistory.length} Days Total
                </div>
            </div>

        </div>
    );
}