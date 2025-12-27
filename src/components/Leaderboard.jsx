import { useState, useEffect } from "react";
import { BsTrophy, BsArrowClockwise } from "react-icons/bs";
import { motion } from "framer-motion";

export default function Leaderboard({ currentPlayer, onClose, show }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Function to load leaderboard data
    const loadLeaderboard = () => {
        try {
            const leaderboardData = localStorage.getItem('polynomialUT_leaderboard');

            if (!leaderboardData) {
                setLeaderboard([]);
                setLastUpdated(new Date());
                return;
            }

            const parsedData = JSON.parse(leaderboardData);

            // Debug: Log what we're getting
            console.log("📊 Raw leaderboard data from localStorage:", parsedData);

            // Convert object to array
            const players = Object.values(parsedData)
                .filter(p => p && p.name && p.name !== "Admin")
                .map(p => {
                    // Ensure all fields exist
                    return {
                        name: p.name || "Unknown",
                        points: Math.floor(p.points || 0),
                        pointsPerSec: p.pointsPerSec || 0,
                        upgradeIds: p.upgradeIds || [],
                        upgradeCount: p.upgradeCount || (p.upgradeIds ? p.upgradeIds.length : 0),
                        variables: p.variables || {},
                        solvedQuestions: p.solvedQuestions || [],
                        lastUpdated: p.lastUpdated || new Date().toISOString()
                    };
                })
                .sort((a, b) => b.points - a.points);

            console.log("✅ Processed leaderboard players:", players);
            setLeaderboard(players);
            setLastUpdated(new Date());

        } catch (error) {
            console.error("❌ Error loading leaderboard:", error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data when leaderboard opens
    useEffect(() => {
        if (show) {
            setLoading(true);
            loadLeaderboard();
        }
    }, [show]);

    // Set up 2-second auto-refresh interval
    useEffect(() => {
        let intervalId;

        if (show) {
            // Set up interval for auto-refresh every 2 seconds
            intervalId = setInterval(() => {
                loadLeaderboard();
            }, 2000);
        }

        // Clean up interval on unmount or when show changes
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [show]);

    // Format large numbers
    const formatNumber = (num) => {
        const n = Math.floor(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    // Format time
    const formatTime = (date) => {
        if (!date) return "";
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleRefresh = () => {
        setLoading(true);
        loadLeaderboard();
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
                                    <h2 className="card-title text-xl">Leaderboard</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="text-base-content/70">
                                            Top {leaderboard.length} players
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-green-600 font-medium">Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefresh}
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

                        {/* Status Bar */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                            <div className="text-base-content/60">
                                Updates every 2 seconds • Saves every 5 seconds
                            </div>
                            {lastUpdated && (
                                <div className="text-base-content/60">
                                    Last updated: {formatTime(lastUpdated)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                                <p className="text-base-content/70">Loading leaderboard...</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🏆</div>
                                <h3 className="text-xl font-semibold mb-2">Leaderboard is Empty</h3>
                                <p className="text-base-content/70 mb-6">
                                    Play the game to earn points and appear here!
                                </p>
                                <div className="stats shadow">
                                    <div className="stat">
                                        <div className="stat-title">Your Chance</div>
                                        <div className="stat-value">#1</div>
                                        <div className="stat-desc">Be the first!</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-base-300">
                                <table className="table w-full">
                                    <thead className="bg-base-300">
                                    <tr>
                                        <th className="w-20 text-center font-bold text-base-content">Rank</th>
                                        <th className="font-bold text-base-content">Player</th>
                                        <th className="text-right font-bold text-base-content">Points</th>
                                        <th className="text-right font-bold text-base-content">PPS</th>
                                        <th className="text-right font-bold text-base-content">Upgrades</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {leaderboard.map((player, index) => {
                                        const isCurrentPlayer = player.name === currentPlayer;
                                        return (
                                            <tr
                                                key={`${player.name}-${index}`}
                                                className={`hover:bg-base-300/50 transition-colors ${
                                                    isCurrentPlayer ? '!bg-primary/10' : ''
                                                }`}
                                            >
                                                {/* Rank */}
                                                <td className="text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                            <span className={`font-bold text-lg ${
                                                                index === 0 ? 'text-warning' :
                                                                    index === 1 ? 'text-base-content/70' :
                                                                        index === 2 ? 'text-warning/70' :
                                                                            'text-base-content/60'
                                                            }`}>
                                                                {index === 0 && "🥇"}
                                                                {index === 1 && "🥈"}
                                                                {index === 2 && "🥉"}
                                                                {index > 2 && `#${index + 1}`}
                                                            </span>
                                                    </div>
                                                </td>

                                                {/* Player Name */}
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">
                                                            {player.name}
                                                        </div>
                                                        {isCurrentPlayer && (
                                                            <span className="badge badge-primary badge-xs font-medium">YOU</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Points */}
                                                <td className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-base">
                                                                {formatNumber(player.points)}
                                                        </span>
                                                        <span className="text-xs text-base-content/60">
                                                                currently
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Points Per Second */}
                                                <td className="text-right">
                                                    <div className="flex flex-col items-end">
                                                            <span className="font-medium">
                                                                {Math.floor(player.pointsPerSec)}
                                                            </span>
                                                        <span className="text-xs text-base-content/60">
                                                                per second
                                                            </span>
                                                    </div>
                                                </td>

                                                {/* Upgrades */}
                                                <td className="text-right">
                                                    <div className="flex flex-col items-end">
                                                            <span className="font-medium">
                                                                {player.upgradeCount}
                                                            </span>
                                                        <span className="text-xs text-base-content/60">
                                                                bought
                                                            </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer Stats */}
                        {!loading && leaderboard.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-base-300">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div className="text-sm text-base-content/70">
                                        Total {leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''} •{' '}
                                        <span className="font-medium">
                                            {leaderboard.reduce((sum, p) => sum + p.points, 0).toLocaleString()}
                                        </span> total points
                                    </div>

                                    {leaderboard.some(p => p.name === currentPlayer && currentPlayer !== "Admin") ? (
                                        <div className="text-sm">
                                            <span className="text-base-content/70">Your position: </span>
                                            <span className="font-bold text-primary">
                                                #{leaderboard.findIndex(p => p.name === currentPlayer) + 1}
                                            </span>
                                        </div>
                                    ) : currentPlayer !== "Admin" && (
                                        <div className="text-sm text-warning font-medium">
                                            Play more to appear on the leaderboard!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}