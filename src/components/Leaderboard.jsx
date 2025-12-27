import { useState, useEffect } from "react";
import { BsTrophy, BsArrowClockwise, BsDatabase, BsCloud } from "react-icons/bs";
import { motion } from "framer-motion";
import { supabase } from '../supabaseClient';

export default function Leaderboard({ currentPlayer, onClose, show }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [dataSource, setDataSource] = useState('supabase');
    const [error, setError] = useState(null);

    const loadLeaderboard = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🔄 Fetching leaderboard from Supabase...");

            const { data: players, error } = await supabase
                .from('players')
                .select('*')
                .order('points', { ascending: false })
                .limit(100);

            if (error) {
                console.error("❌ Supabase error:", error);
                throw error;
            }

            console.log(`✅ Loaded ${players?.length || 0} players from Supabase`);

            const formattedPlayers = (players || []).map(player => ({
                name: player.username,
                points: player.points || 0,
                pointsPerSec: player.points_per_sec || 0,
                upgradeCount: player.upgrade_count || 0,
                variables: player.variables || {},
                solvedQuestions: player.solved_questions || [],
                lastUpdated: player.last_updated || new Date().toISOString()
            }));

            setLeaderboard(formattedPlayers);
            setDataSource('supabase');

        } catch (supabaseError) {
            console.error("⚠️ Failed to load from Supabase:", supabaseError);
            setError("Failed to load from server. Using local data...");

            // Fallback to localStorage
            try {
                const leaderboardData = JSON.parse(localStorage.getItem('polynomialUT_leaderboard') || '{}');
                const players = Object.values(leaderboardData)
                    .filter(p => p && p.name && p.name !== "Admin")
                    .sort((a, b) => b.points - a.points);

                setLeaderboard(players);
                setDataSource('local');
            } catch (localError) {
                console.error("❌ Both sources failed:", localError);
                setLeaderboard([]);
            }
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    };

    // Load when leaderboard opens
    useEffect(() => {
        if (show) {
            loadLeaderboard();
        }
    }, [show]);

    // Auto-refresh every 3 seconds
    useEffect(() => {
        let intervalId;
        if (show) {
            intervalId = setInterval(() => {
                loadLeaderboard();
            }, 3000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [show]);

    const formatNumber = (num) => {
        const n = Math.floor(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    const formatTime = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="card bg-base-200 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-body p-0">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-200 px-6 py-4 border-b border-base-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BsTrophy className="text-2xl text-warning" />
                                <div>
                                    <h2 className="card-title text-xl">Global Leaderboard</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="flex items-center gap-1">
                                            {dataSource === 'supabase' ? (
                                                <>
                                                    <BsCloud className="text-info" />
                                                    <span className="text-info">Live Server</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BsDatabase className="text-warning" />
                                                    <span className="text-warning">Local Data</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-green-600">Auto-refresh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={loadLeaderboard}
                                    className="btn btn-sm btn-ghost"
                                    title="Refresh"
                                    disabled={loading}
                                >
                                    <BsArrowClockwise className={`text-base ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                            <div className="text-base-content/60">
                                {dataSource === 'supabase'
                                    ? "Connected to cloud database • Updates every 3s"
                                    : "Using local storage • Server connection failed"}
                            </div>
                            {lastUpdated && (
                                <div className="text-base-content/60">
                                    Updated: {formatTime(lastUpdated)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                                <p className="text-base-content/70">
                                    {dataSource === 'supabase'
                                        ? "Connecting to global leaderboard..."
                                        : "Loading local leaderboard..."}
                                </p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🏆</div>
                                <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
                                <p className="text-base-content/70 mb-6">
                                    Be the first to appear on the global leaderboard!
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-base-300">
                                <table className="table w-full">
                                    <thead className="bg-base-300">
                                    <tr>
                                        <th className="w-20 text-center">Rank</th>
                                        <th>Player</th>
                                        <th className="text-right">Points</th>
                                        <th className="text-right">PPS</th>
                                        <th className="text-right">Upgrades</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {leaderboard.map((player, index) => {
                                        const isCurrentPlayer = player.name === currentPlayer;
                                        return (
                                            <tr
                                                key={`${player.name}-${index}`}
                                                className={`hover:bg-base-300/50 ${isCurrentPlayer ? '!bg-primary/10' : ''}`}
                                            >
                                                <td className="text-center font-bold">
                                                    {index === 0 && "🥇"}
                                                    {index === 1 && "🥈"}
                                                    {index === 2 && "🥉"}
                                                    {index > 2 && `#${index + 1}`}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{player.name}</span>
                                                        {isCurrentPlayer && (
                                                            <span className="badge badge-primary badge-xs">YOU</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <div className="font-bold">{formatNumber(player.points)}</div>
                                                </td>
                                                <td className="text-right">{Math.floor(player.pointsPerSec)}</td>
                                                <td className="text-right">{player.upgradeCount}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}