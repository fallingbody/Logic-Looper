import { useState, useEffect } from 'react';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch from your Vercel/Neon API
                const response = await fetch('/api/leaderboard');
                
                if (response.ok) {
                    const data = await response.json();
                    setLeaders(data);
                } else {
                    setLeaders([]);
                }
            } catch (error) {
                console.error("Leaderboard fetch failed:", error);
                setLeaders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="text-slate-500 text-xs font-mono animate-pulse">SYNCING_NETWORK...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-sm font-bold tracking-wider">GLOBAL RANKING</h3>
                <span className="text-[10px] text-green-400 bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">
                    LIVE
                </span>
            </div>

            <div className="space-y-2">
                {leaders.length === 0 ? (
                    <div className="text-slate-600 text-xs text-center py-4 italic">
                        No connection to mainframe.
                    </div>
                ) : (
                    leaders.map((player, index) => (
                        <div 
                            key={index} 
                            className="flex justify-between items-center p-2 rounded text-xs font-mono border bg-transparent border-slate-800/50 text-slate-500"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold w-4 text-center text-slate-600">
                                    {index + 1}
                                </span>
                                <span className="truncate max-w-[120px]">
                                    {player.nickname || 'User'}
                                </span>
                            </div>
                            <span className="font-bold">{player.points} PTS</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
