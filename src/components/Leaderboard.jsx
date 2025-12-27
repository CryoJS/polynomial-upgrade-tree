import { useState, useEffect } from "react";
import { BsTrophy } from "react-icons/bs";
import { motion } from "framer-motion";

export default function Leaderboard({ currentPlayer, onClose }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    function loadLeaderboard() {
        try {
            // Get leaderboard data from localStorage
            const leaderboardData = JSON.parse(localStorage.getItem('polynomialUT_leaderboard') || '{}');

            // Convert object to array and sort
            const players = Object.values(leaderboardData)
                .filter(p => p && p.name && typeof p.points === 'number')
                .sort((a, b) => {
                    if (b.points !== a.points) return b.points - a.points;
                    return (b.pointsPerSec || 0) - (a.pointsPerSec || 0);
                });

            setLeaderboard(players);
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="card bg-base-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BsTrophy className="text-3xl text-warning" />
                            <h2 className="card-title text-2xl">Leaderboard</h2>
                        </div>
                        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                            ✕
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-base-content/70">
                            No players yet. Be the first!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                <tr>
                                    <th className="w-16">Rank</th>
                                    <th>Player</th>
                                    <th className="text-right">Points</th>
                                    <th className="text-right">Points/sec</th>
                                    <th className="text-right">Upgrades</th>
                                </tr>
                                </thead>
                                <tbody>
                                {leaderboard.map((player, index) => {
                                    const isCurrentPlayer = player.name === currentPlayer;
                                    return (
                                        <tr key={player.name} className={isCurrentPlayer ? "bg-primary/20" : ""}>
                                            <td className="font-bold">
                                                {index === 0 && "🥇"}
                                                {index === 1 && "🥈"}
                                                {index === 2 && "🥉"}
                                                {index > 2 && `#${index + 1}`}
                                            </td>
                                            <td className="font-semibold">
                                                {player.name}
                                                {isCurrentPlayer && (
                                                    <span className="ml-2 badge badge-primary badge-sm">You</span>
                                                )}
                                            </td>
                                            <td className="text-right">{Math.floor(player.points)}</td>
                                            <td className="text-right">{player.pointsPerSec || 0}</td>
                                            <td className="text-right">{player.upgradeCount || 0}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
