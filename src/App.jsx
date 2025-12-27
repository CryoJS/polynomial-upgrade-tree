import { useState, useEffect, useRef, useCallback } from "react";
import { BsCaretUpSquare, BsTrophy, BsBoxArrowRight } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

import { questionData } from "./questionData";
import UpgradeBtn from "./components/UpgradeBtn.jsx";
import UpgradePopup from "./components/UpgradePopup.jsx";
import AnswerReviewPopup from "./components/AnswerReviewPopup.jsx";
import LoginPage from "./components/LoginPage";
import Leaderboard from "./components/Leaderboard";
import ConfirmDialog from "./components/ConfirmDialog.jsx";

function GamePage({ playerName, onLogout, isAdmin, savedPlayerData, saveRef }) {
    const [currency, setCurrency] = useState(savedPlayerData?.points || 0);
    const [boughtUpgrades, setBoughtUpgrades] = useState(savedPlayerData?.upgradeIds || []);
    const [variables, setVariables] = useState(savedPlayerData?.variables || { x: 1, a0: 0, a1: 0, a2: 0 });
    const [solvedQuestions, setSolvedQuestions] = useState(savedPlayerData?.solvedQuestions || []);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const [activePopup, setActivePopup] = useState(null);
    const [pendingUpgrade, setPendingUpgrade] = useState(null);
    const [notification, setNotification] = useState(null);
    const [reviewPopup, setReviewPopup] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const functionValue =
        variables.a2 * variables.x ** 2 +
        variables.a1 * variables.x +
        variables.a0;

    // FIXED: Save player data function with proper data structure
    const savePlayerData = useCallback(() => {
        try {
            // Don't save admin data to leaderboard
            if (isAdmin || playerName === "Admin") {
                console.log("Admin account - not saving to leaderboard");
                return;
            }

            const playerData = {
                name: playerName,
                points: Math.floor(currency),
                pointsPerSec: functionValue,
                upgradeIds: boughtUpgrades,
                upgradeCount: boughtUpgrades.length,
                variables: { ...variables },
                solvedQuestions: [...solvedQuestions],
                lastUpdated: new Date().toISOString(),
            };

            console.log("🔄 Saving player data:", playerData);

            // Get existing leaderboard data
            const existingData = localStorage.getItem('polynomialUT_leaderboard');
            const leaderboardData = existingData ? JSON.parse(existingData) : {};

            // Update or add player data
            leaderboardData[playerName] = playerData;

            // Save back to localStorage
            localStorage.setItem('polynomialUT_leaderboard', JSON.stringify(leaderboardData));

            console.log("✅ Player data saved successfully!");
            console.log("Current leaderboard data:", leaderboardData);

        } catch (error) {
            console.error("❌ Error saving player data:", error);
        }
    }, [currency, functionValue, boughtUpgrades, variables, solvedQuestions, playerName, isAdmin]);

    // Expose save function to App for logout
    useEffect(() => {
        if (saveRef) {
            saveRef.current = savePlayerData;
        }
        return () => {
            if (saveRef) {
                saveRef.current = null;
            }
        };
    }, [savePlayerData, saveRef]);

    // Auto-save every 5s - FIXED
    useEffect(() => {
        const interval = setInterval(() => {
            savePlayerData();
        }, 5000);
        return () => clearInterval(interval);
    }, [savePlayerData]);

    // Update points every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrency(c => c + functionValue);
        }, 1000);
        return () => clearInterval(interval);
    }, [functionValue]);

    // Also save when important data changes
    useEffect(() => {
        if (!isAdmin && playerName !== "Admin") {
            savePlayerData();
        }
    }, [boughtUpgrades, variables, solvedQuestions]);

    // Reset leaderboard function for admin
    const resetLeaderboard = () => {
        setConfirmDialog({
            message: "Are you sure you want to reset the leaderboard? This will delete ALL player data.",
            confirmText: "Yes, Reset",
            cancelText: "Cancel",
            onConfirm: () => {
                localStorage.removeItem('polynomialUT_leaderboard');
                showNotification("Leaderboard reset!", "success");
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    function showNotification(message, type = "success", duration = 1200) {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), duration);
    }

    function buyUpgrade(id, cost) {
        setCurrency(c => c - cost);
        setBoughtUpgrades(u => [...u, id]);
    }

    function deductMoney(amount) {
        setCurrency(c => Math.max(c - amount, 0));
    }

    function attemptBuy(upgrade) {
        if (!upgrade.question) {
            upgrade.onBuy();
            showNotification("Upgrade purchased!", "success");
            return;
        }

        const popup = questionData[upgrade.question];
        if (!popup) {
            console.error("Missing question data:", upgrade.question);
            return;
        }

        setPendingUpgrade(upgrade);
        setActivePopup(popup);
    }

    function handleQuestionSuccess() {
        if (pendingUpgrade && pendingUpgrade.question) {
            setSolvedQuestions(prev => [...prev, pendingUpgrade.question]);
        }
        if (pendingUpgrade && pendingUpgrade.onBuy) {
            pendingUpgrade.onBuy();
        }
        setActivePopup(null);
        setPendingUpgrade(null);
    }

    function viewAnswer(questionId) {
        const popup = questionData[questionId];
        if (popup) setReviewPopup(popup);
    }

    const upgrades = [
        {
            id: "0",
            title: "Welcome to...\nPolynomial Upgrade Tree!",
            description: "Use points, generated by your function, to buy upgrades and progress through the tree.",
            cost: 0,
            prereqs: [],
            question: null,
            onBuy: () => buyUpgrade("0", 0)
        },

        {
            id: "1",
            title: "──⋆⋅ Constant Term ⋅⋆──",
            description: "Start generating points!\nUnlock degree 0 term: a₀ = 1.",
            cost: 0,
            prereqs: ["0"],
            question: "JK1",
            onBuy: () => {
                buyUpgrade("1", 0);
                setVariables(v => ({ ...v, a0: 1 }));
            }
        },

        {
            id: "2",
            title: "The First of Many",
            description: "Upgrade a₀ to 2.",
            cost: 3,
            prereqs: ["1"],
            question: "JA1",
            onBuy: () => {
                buyUpgrade("2", 3);
                setVariables(v => ({ ...v, a0: 2 }));
            }
        },

        {
            id: "3",
            title: "Duplication Glitch?",
            description: "Double a₀'s value!",
            cost: 10,
            prereqs: ["2"],
            question: "JK2",
            onBuy: () => {
                buyUpgrade("3", 10);
                setVariables(v => ({ ...v, a0: 4 }));
            }
        },

        {
            id: "4",
            title: "──⋆⋅ Linear Term ⋅⋆──",
            description: "Unlock degree 1 term: a₁ × x, where a₁ = 1.",
            cost: 20,
            prereqs: ["3"],
            question: "JC1",
            onBuy: () => {
                buyUpgrade("4", 20);
                setVariables(v => ({ ...v, a1: 1 }));
            }
        },

        {
            id: "5.1",
            title: "The First x Increase",
            description: "Upgrade x's value to 2.",
            cost: 30,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JK3",
            onBuy: () => {
                buyUpgrade("5.1", 30);
                setVariables(v => ({ ...v, x: 2 }));
            }
        },

        {
            id: "5.2",
            title: "Another Typical Increase",
            description: "Upgrade a₀'s value to 5.",
            cost: 30,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JT2",
            onBuy: () => {
                buyUpgrade("5.2", 30);
                setVariables(v => ({ ...v, a0: 5 }));
            }
        },

        {
            id: "6",
            title: "Double? No! Let's Triple!",
            description: "Triple a₀'s value.",
            cost: 100,
            prereqs: ["4"],
            question: "JK4",
            onBuy: () => {
                buyUpgrade("6", 100);
                setVariables(v => ({ ...v, a0: 15 }));
            }
        },

        {
            id: "7.1",
            title: "Linear: Upgrade Constant",
            description: "Upgrade a₀'s value to 20.",
            cost: 200,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JA2",
            onBuy: () => {
                buyUpgrade("7.1", 200);
                setVariables(v => ({ ...v, a0: 20 }));
            }
        },

        {
            id: "7.2",
            title: "Linear: Upgrade Slope",
            description: "Upgrade a₁'s value to 2.",
            cost: 200,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JK5",
            onBuy: () => {
                buyUpgrade("7.2", 200);
                setVariables(v => ({ ...v, a1: 2 }));
            }
        },

        {
            id: "7.3",
            title: "Linear: Upgrade the Input",
            description: "Double x's value.",
            cost: 200,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JC2",
            onBuy: () => {
                buyUpgrade("7.3", 200);
                setVariables(v => ({ ...v, x: 4 }));
            }
        },

        {
            id: "8",
            title: "Insane Increase?",
            description: "Set x's value to 10.",
            cost: 500,
            prereqs: ["7.1", "7.2", "7.3"],
            question: "JK6",
            onBuy: () => {
                buyUpgrade("8", 500);
                setVariables(v => ({ ...v, x: 10 }));
            }
        },

        {
            id: "9",
            title: "──⋆⋅ Quadratic Term ⋅⋆──",
            description: "Unlock degree 2 term: a₂ × x², where a₂ = 1.",
            cost: 1000,
            prereqs: ["8"],
            question: "JT1",
            onBuy: () => {
                buyUpgrade("9", 1000);
                setVariables(v => ({ ...v, a2: 1 }));
            }
        },
    ];

    const rows = [];
    const handled = new Set();

    upgrades.forEach(upg => {
        if (!upg.prereqs.every(p => boughtUpgrades.includes(p))) return;

        if (upg.rowGroup != null) {
            if (handled.has(upg.rowGroup)) return;

            const group = upgrades.filter(
                u =>
                    u.rowGroup === upg.rowGroup &&
                    u.prereqs.every(p => boughtUpgrades.includes(p))
            );

            rows.push(
                <div className="flex justify-center gap-6" key={upg.rowGroup}>
                    {group.map(u => (
                        <UpgradeBtn
                            key={u.id}
                            {...u}
                            boughtUpgrades={boughtUpgrades}
                            currency={currency}
                            onBuy={() => attemptBuy(u)}
                            onViewAnswer={() => viewAnswer(u.question)}
                            hasAnswer={u.question && solvedQuestions.includes(u.question)}
                        />
                    ))}
                </div>
            );

            handled.add(upg.rowGroup);
        } else {
            rows.push(
                <div className="flex justify-center" key={upg.id}>
                    <UpgradeBtn
                        {...upg}
                        boughtUpgrades={boughtUpgrades}
                        currency={currency}
                        onBuy={() => attemptBuy(upg)}
                        onViewAnswer={() => viewAnswer(upg.question)}
                        hasAnswer={upg.question && solvedQuestions.includes(upg.question)}
                    />
                </div>
            );
        }
    });

    return (
        <div className="min-h-screen bg-base-100 text-base-content">
            {/* Navbar */}
            <div className="sticky top-0 z-50 navbar bg-base-200 px-5 py-2 shadow-md flex items-center min-h-0">
                {/* Title*/}
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <BsCaretUpSquare/>
                    Polynomial<span className="text-base">UT</span>
                </div>

                {/* Function Display */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-14 sm:top-2 text-lg font-semibold text-base-100 bg-primary px-2 py-0 rounded">
                    f(x) = {
                    (() => {
                        const terms = Object.entries(variables)
                            .filter(([key, val]) => key.startsWith("a") && val !== 0)
                            .sort((a, b) => parseInt(b[0].slice(1)) - parseInt(a[0].slice(1)))
                            .map(([key, val]) => {
                                const degree = parseInt(key.slice(1));
                                if (degree === 0) return <span key={key}>{val}</span>;
                                const coeff = val === 1 ? "" : val;
                                return <span key={key}>{coeff}x{degree > 1 && <sup>{degree}</sup>}</span>;
                            });
                        return terms.length > 0 ? terms.reduce((prev, curr) => [prev, " + ", curr]) : "0";
                    })()
                }
                </div>

                {/* Player Info & Actions */}
                <div className="ml-auto flex items-center gap-2">
                    {/* Username Display */}
                    <div className="badge badge-primary font-semibold">{playerName}</div>

                    {/* Admin Controls */}
                    {isAdmin && (
                        <button
                            onClick={resetLeaderboard}
                            className="btn btn-sm btn-error ml-2"
                            title="Reset Leaderboard"
                        >
                            Reset Leaderboard
                        </button>
                    )}

                    {/* Leaderboard Panel Open */}
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="btn btn-sm btn-ghost"
                        title="View Leaderboard"
                    >
                        <BsTrophy className="text-lg" />
                    </button>

                    {/* Log Out */}
                    <button
                        onClick={onLogout}
                        className="btn btn-sm btn-ghost"
                        title="Logout"
                    >
                        <BsBoxArrowRight className="text-lg" />
                    </button>

                    {/* Theme Toggle */}
                    <label className="toggle text-base-content">
                        <input type="checkbox" value="dark" className="theme-controller"/>
                        <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v2"></path>
                                <path d="M12 20v2"></path>
                                <path d="m4.93 4.93 1.41 1.41"></path>
                                <path d="m17.66 17.66 1.41 1.41"></path>
                                <path d="M2 12h2"></path>
                                <path d="M20 12h2"></path>
                                <path d="m6.34 17.66-1.41 1.41"></path>
                                <path d="m19.07 4.93-1.41 1.41"></path>
                            </g>
                        </svg>
                        <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                            </g>
                        </svg>
                    </label>
                </div>
            </div>

            {/* Upgrade Tree */}
            <div className="my-30 p-6 flex flex-col gap-6">
                {rows}
            </div>

            {/* Stats Panel */}
            <div className="fixed bottom-4 left-4 w-56 z-40">
                <div className="collapse collapse-arrow bg-base-200 shadow-lg rounded-box">
                    <input type="checkbox" defaultChecked />

                    <div className="collapse-title font-semibold text-sm">
                        Stats
                    </div>

                    <div className="collapse-content text-sm">
                        <div>Points: {Math.floor(currency)}</div>
                        <div>Points/sec: {functionValue}</div>
                    </div>
                </div>
            </div>

            {/* Variables Panel */}
            <div className="fixed bottom-4 right-4 w-56 z-40">
                <div className="collapse collapse-arrow bg-base-200 shadow-lg rounded-box">
                    <input type="checkbox" defaultChecked />

                    <div className="collapse-title font-semibold text-sm">
                        Variables
                    </div>

                    <div className="collapse-content text-sm">
                        {Object.entries(variables)
                            .filter(([_, val]) => val !== 0)
                            .map(([key, val]) => (
                                <div key={key}>
                                    {key.startsWith("a") ? <>a<sub>{key.slice(1)}</sub></> : key} = {val}
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Question Popup */}
            <UpgradePopup
                popup={activePopup}
                upgradeCost={pendingUpgrade?.cost}
                deductMoney={deductMoney}
                onSuccess={handleQuestionSuccess}
                onClose={() => {
                    setActivePopup(null);
                    setPendingUpgrade(null);
                }}
                showNotification={showNotification}
            />

            {/* Answer Review Popup */}
            <AnimatePresence>
                {reviewPopup && (
                    <AnswerReviewPopup
                        popup={reviewPopup}
                        onClose={() => setReviewPopup(null)}
                    />
                )}
            </AnimatePresence>

            {/* Leaderboard */}
            <AnimatePresence>
                {showLeaderboard && (
                    <Leaderboard
                        currentPlayer={playerName}
                        show={showLeaderboard}
                        onClose={() => setShowLeaderboard(false)}
                    />
                )}
            </AnimatePresence>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
                    >
                        <div
                            className={`px-4 py-2 border rounded text-center min-w-[260px] bg-base-100 backdrop-blur-sm ${
                                notification.type === "success"
                                    ? "text-success"
                                    : "text-error"
                            }`}
                        >
                            {notification.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    isOpen={true}
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </div>
    );
}

export default function App() {
    const [playerName, setPlayerName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [savedPlayerData, setSavedPlayerData] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const saveRef = useRef(null);

    const handleLogin = (name, admin = false) => {
        setIsAdmin(admin);

        if (admin) {
            setPlayerName(name);
            setSavedPlayerData({
                points: 0,
                upgradeIds: [],
                variables: { x: 1, a0: 0, a1: 0, a2: 0 },
                solvedQuestions: []
            });
            return;
        }

        const leaderboardData = JSON.parse(localStorage.getItem('polynomialUT_leaderboard') || '{}');
        const savedData = leaderboardData[name] || null;

        setPlayerName(name);
        setSavedPlayerData(savedData);
    };

    const handleLogout = () => {
        // Save before logout if not admin
        if (!isAdmin && saveRef.current) {
            console.log("Saving before logout...");
            saveRef.current();
        }

        setConfirmDialog({
            message: "Are you sure you want to logout? Your progress is saved.",
            onConfirm: () => {
                setPlayerName(null);
                setIsAdmin(false);
                setSavedPlayerData(null);
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null),
        });
    };

    if (!playerName) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <>
            <GamePage
                playerName={playerName}
                onLogout={handleLogout}
                isAdmin={isAdmin}
                savedPlayerData={savedPlayerData || {
                    points: 0,
                    upgradeIds: [],
                    variables: { x: 1, a0: 0, a1: 0, a2: 0 },
                    solvedQuestions: []
                }}
                saveRef={saveRef}
            />

            {confirmDialog && (
                <ConfirmDialog
                    isOpen={true}
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </>
    );
}