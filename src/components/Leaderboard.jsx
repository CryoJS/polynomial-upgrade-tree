import { useState, useEffect } from "react";
import { BsTrophy, BsArrowClockwise, BsCloud, BsDatabase } from "react-icons/bs";
import { motion } from "framer-motion";
import { getLeaderboardData } from '../supabaseClient';

export default function Leaderboard({ currentPlayer, onClose, show }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState('supabase');
    const [refreshCount, setRefreshCount] = useState(0);

    const loadLeaderboard = async (isAutoRefresh = false) => {
        if (!isAutoRefresh) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            console.log(`🔄 ${isAutoRefresh ? "Auto-refreshing" : "Loading"} leaderboard...`);

            const result = await getLeaderboardData();

            if (!result.success) {
                throw new Error(result.error || "Failed to load leaderboard");
            }

            const formattedPlayers = (result.data || []).map(player => ({
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
            console.log(`✅ Loaded ${formattedPlayers.length} players`);

        } catch (err) {
            console.error("❌ Leaderboard error:", err);
            setError(err.message);
            setDataSource('error');

            // Fallback to localStorage if Supabase fails
            try {
                const leaderboardData = JSON.parse(localStorage.getItem('polynomialUT_leaderboard') || '{}');
                const players = Object.values(leaderboardData)
                    .filter(p => p && p.name && p.name !== "Admin")
                    .sort((a, b) => b.points - a.points);

                setLeaderboard(players);
                setDataSource('local');
            } catch (localError) {
                console.error("❌ Local fallback also failed:", localError);
                setLeaderboard([]);
            }
        } finally {
            if (!isAutoRefresh) {
                setLoading(false);
            }
            setRefreshing(false);
            setLastUpdated(new Date());
            setRefreshCount(prev => prev + 1);
        }
    };

    // Load when leaderboard opens
    useEffect(() => {
        if (show) {
            loadLeaderboard();
        }
    }, [show]);

    // Auto-refresh every 3 seconds when open
    useEffect(() => {
        let intervalId;
        if (show) {
            intervalId = setInterval(() => {
                loadLeaderboard(true);
            }, 3000); // Refresh every 3 seconds
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [show]); // Only depend on show, not loadLeaderboard

    const formatNumber = (num) => {
        const n = Math.floor(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    const formatTime = (date) => {
        if (!date) return "";
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 5) return "Just now";
        if (diffSec < 60) return `${diffSec}s ago`;

        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatTimeFull = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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
                                                    <span className="text-info">Live Supabase</span>
                                                </>
                                            ) : dataSource === 'local' ? (
                                                <>
                                                    <BsDatabase className="text-warning" />
                                                    <span className="text-warning">Local Storage</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BsCloud className="text-error" />
                                                    <span className="text-error">Connection Error</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
                                            <span className="text-green-600">Auto-refresh (3s)</span>
                                        </div>
                                        <div className="text-xs text-base-content/50">
                                            #{refreshCount}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => loadLeaderboard(false)}
                                    className="btn btn-sm btn-ghost relative"
                                    title="Refresh Now"
                                    disabled={loading || refreshing}
                                >
                                    <BsArrowClockwise className={`text-base ${refreshing || loading ? 'animate-spin' : ''}`} />
                                    {refreshing && (
                                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                                    )}
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
                                    ? "Real-time updates • Auto-refreshes every 3 seconds"
                                    : dataSource === 'local'
                                        ? "Using local storage backup • Supabase connection failed"
                                        : "Connection error • Try refreshing"}
                            </div>
                            {lastUpdated && (
                                <div className="text-base-content/60 flex items-center gap-1">
                                    {refreshing ? (
                                        <>
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            <span>Refreshing...</span>
                                        </>
                                    ) : loading ? (
                                        <>
                                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <span title={formatTimeFull(lastUpdated)}>
                                                Updated: {formatTime(lastUpdated)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                        {loading && !refreshing ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                                <p className="text-base-content/70">
                                    {dataSource === 'supabase'
                                        ? "Connecting to Supabase database..."
                                        : "Loading leaderboard..."}
                                </p>
                            </div>
                        ) : error && dataSource === 'error' ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4 text-error">⚠️</div>
                                <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
                                <p className="text-base-content/70 mb-4">{error}</p>
                                <button
                                    onClick={() => loadLeaderboard(false)}
                                    className="btn btn-sm btn-primary"
                                >
                                    Try Again
                                </button>
                                <p className="text-xs text-base-content/50 mt-4">
                                    Showing local storage data as fallback
                                </p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🏆</div>
                                <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
                                <p className="text-base-content/70 mb-6">
                                    Be the first to appear on the global leaderboard!
                                </p>
                                {dataSource === 'local' && (
                                    <p className="text-xs text-warning">
                                        ⚠️ Using local storage - Supabase connection unavailable
                                    </p>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Data source indicator */}
                                {dataSource === 'local' && (
                                    <div className="alert alert-warning alert-sm mb-4">
                                        <span className="text-xs">
                                            ⚠️ Showing local backup data. Supabase connection unavailable.
                                        </span>
                                    </div>
                                )}

                                <div className="overflow-x-auto rounded-lg border border-base-300 relative">
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
                                                    key={`${player.name}-${index}-${refreshCount}`}
                                                    className={`hover:bg-base-300/50 transition-colors duration-200 ${
                                                        isCurrentPlayer ? '!bg-primary/10 !border-l-4 !border-l-primary' : ''
                                                    } ${refreshing ? 'opacity-90' : ''}`}
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
                                                                <span className="badge badge-primary badge-xs animate-pulse">YOU</span>
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

                                    {/* Bottom status bar */}
                                    <div className="sticky bottom-0 bg-base-300/80 backdrop-blur-sm px-4 py-2 text-xs text-base-content/60 border-t border-base-300">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                Showing {leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''}
                                                {dataSource === 'supabase' && ' • Live updates'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {refreshing ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                        Syncing...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        Connected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}