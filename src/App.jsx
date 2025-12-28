import { useState, useEffect, useRef, useCallback } from "react";
import { BsCaretUpSquare, BsTrophy, BsBoxArrowRight, BsMusicNoteBeamed } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, saveUserData, loadUserData, forceSaveUser } from './supabaseClient';

import { questionData } from "./questionData";
import UpgradeBtn from "./components/UpgradeBtn";
import UpgradePopup from "./components/UpgradePopup";
import AnswerReviewPopup from "./components/AnswerReviewPopup";
import LoginPage from "./components/LoginPage";
import Leaderboard from "./components/Leaderboard";
import ConfirmDialog from "./components/ConfirmDialog";
import MultiplierRain from "./components/MultiplierRain";
import AudioControls from './components/AudioControls';
import { useAudio } from './contexts/AudioContext';

function GamePage({ playerName, onLogout, isAdmin, savedPlayerData, saveRef }) {
    const [currency, setCurrency] = useState(savedPlayerData?.points || 0);
    const [boughtUpgrades, setBoughtUpgrades] = useState(savedPlayerData?.upgradeIds || []);
    const [variables, setVariables] = useState(savedPlayerData?.variables || { x: 1, a0: 0, a1: 0, a2: 0 });
    const [solvedQuestions, setSolvedQuestions] = useState(savedPlayerData?.solvedQuestions || []);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showAudioControls, setShowAudioControls] = useState(false);
    const { playSoundEffect, isMusicPlaying, isMuted } = useAudio();

    const [activePopup, setActivePopup] = useState(null);
    const [pendingUpgrade, setPendingUpgrade] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [reviewPopup, setReviewPopup] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    // Calculate function value
    const calculateFunctionValue = (vars = variables) => {
        return vars.a2 * vars.x ** 2 + vars.a1 * vars.x + vars.a0;
    };
    const functionValue = calculateFunctionValue();

    const handleManualClick = () => {
        setCurrency(c => c + functionValue);
        playSoundEffect('click');
    };

    // Notifications
    function showNotification(message, type = "success", duration = 1200, options = {}) {
        const typeConfigs = {
            success: { icon: "✅" },
            error: { icon: "❌" },
            info: { icon: "ℹ️" },
            warning: { icon: "⚠️" },
            constant: { icon: "💵" },
            rare: { icon: "✨" }
        };

        const config = typeConfigs[type] || typeConfigs.info;
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            message,
            type,
            icon: config.icon,
            ...options
        };

        setNotifications(prev => [newNotification, ...prev]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);

        return id;
    }

    const handleCollectMultiplier = (multiplier, value) => {
        // Add points
        setCurrency(c => c + value);

        // Show appropriate notification
        if (multiplier.type === 'rare') {
            showNotification(
                `+${value} points! (${multiplier.display})`,
                "rare",
                1500,
                { isRare: true }
            );
            playSoundEffect('reward');
        } else {
            showNotification(
                `+${multiplier.value} points collected!`,
                "constant",
                1200
            );
            playSoundEffect('click');
        }

        // Save after collection
        setTimeout(() => savePlayerData(), 500);
    };

    // Save player data function
    const savePlayerData = useCallback(async () => {
        if (!playerName || playerName === "Admin" || isAdmin) {
            console.log("Admin account - not saving");
            return;
        }

        console.log('🚀🚀🚀 ATTEMPTING SAVE for:', playerName);

        try {
            // Try the normal save first
            const result = await saveUserData(playerName, {
                points: currency,
                pointsPerSec: functionValue,
                upgradeIds: boughtUpgrades,
                variables: variables,
                solvedQuestions: solvedQuestions
            });

            if (result.success) {
                console.log('✅✅✅ SAVE SUCCESSFUL');
            } else {
                console.log('⚠️ Normal save failed, trying force save...');
                // Try force save
                const forceResult = await forceSaveUser(playerName, {
                    points: currency,
                    pointsPerSec: functionValue,
                    upgradeIds: boughtUpgrades,
                    variables: variables,
                    solvedQuestions: solvedQuestions
                });

                if (forceResult.success) {
                    console.log('✅✅✅ FORCE SAVE SUCCESSFUL');
                } else {
                    console.error('❌❌❌ BOTH SAVES FAILED');
                }
            }
        } catch (error) {
            console.error('❌❌❌ SAVE ERROR:', error.message);
        }
    }, [currency, functionValue, boughtUpgrades, variables, solvedQuestions, playerName, isAdmin]);

    // Admin Auto Unlock
    useEffect(() => {
        if (isAdmin) {
            // Auto-unlock all upgrades for admin
            const allUpgradeIds = upgrades.map(u => u.id);
            if (boughtUpgrades.length !== allUpgradeIds.length) {
                setBoughtUpgrades(allUpgradeIds);
            }

            // Auto-solve all questions for admin
            const allQuestionIds = upgrades
                .map(u => u.question)
                .filter(q => q && !solvedQuestions.includes(q));

            if (allQuestionIds.length > 0) {
                setSolvedQuestions(prev => [...prev, ...allQuestionIds]);
            }
        }
    }, [isAdmin, boughtUpgrades.length, solvedQuestions.length, currency]);

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

    // Auto-save every 5s
    useEffect(() => {
        if (playerName === "Admin" || isAdmin) return;

        savePlayerData();

        const interval = setInterval(() => {
            savePlayerData();
        }, 5000);

        return () => clearInterval(interval);
    }, [savePlayerData, playerName, isAdmin]);

    // Update points every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrency(c => {
                const newCurrency = c + functionValue;
                return newCurrency;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [functionValue]);

    // Save when ANY important data changes
    useEffect(() => {
        if (!isAdmin && playerName !== "Admin") {
            const timer = setTimeout(() => {
                savePlayerData();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [boughtUpgrades, variables, solvedQuestions, savePlayerData, isAdmin, playerName]);

    // Reset leaderboard function for admin
    const resetLeaderboard = () => {
        playSoundEffect('click');
        setConfirmDialog({
            message: "Are you sure you want to reset the leaderboard? This will delete ALL player data from the Supabase database.",
            confirmText: "Yes, Delete All Data",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    console.log("🗑️ Admin: Deleting all player data from Supabase...");

                    // Delete all players from Supabase
                    const { error } = await supabase
                        .from('players')
                        .delete()
                        .neq('username', 'Admin');

                    if (error) {
                        console.error("❌ Error deleting from Supabase:", error);
                        throw error;
                    }

                    console.log("✅ All player data deleted from Supabase");
                    localStorage.removeItem('polynomialUT_leaderboard');
                    showNotification("Leaderboard reset successfully! All player data deleted.", "success");
                    setConfirmDialog(null);

                } catch (error) {
                    console.error("❌ Error resetting leaderboard:", error);
                    showNotification(`Error resetting leaderboard: ${error.message}`, "error");
                    setConfirmDialog(null);
                }
            },
            onCancel: () => {
                playSoundEffect('click');
                setConfirmDialog(null);
            },
        });
    };

    function buyUpgrade(id, cost) {
        setCurrency(c => c - cost);
        setBoughtUpgrades(u => [...u, id]);
        playSoundEffect('purchase-success');
        setTimeout(() => savePlayerData(), 500);
    }

    function deductMoney(amount) {
        setCurrency(c => Math.max(c - amount, 0));
    }

    function attemptBuy(upgrade) {
        playSoundEffect('click');
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
        playSoundEffect('purchase-success');
        if (pendingUpgrade && pendingUpgrade.question) {
            setSolvedQuestions(prev => [...prev, pendingUpgrade.question]);
        }
        if (pendingUpgrade && pendingUpgrade.onBuy) {
            pendingUpgrade.onBuy();
        }
        setActivePopup(null);
        setPendingUpgrade(null);
        setTimeout(() => savePlayerData(), 500);
    }

    function handleQuestionFail() {
        playSoundEffect('purchase-fail');
        setActivePopup(null);
        setPendingUpgrade(null);
    }

    function viewAnswer(questionId) {
        playSoundEffect('click');
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
            id: "0.1",
            title: "What are points?",
            description: "Points are generated passively, at a rate of the value of f(x) every second.",
            cost: 0,
            prereqs: ["0"],
            question: null,
            onBuy: () => buyUpgrade("0.1", 0)
        },
        {
            id: "0.2",
            title: "How do I get more points?",
            description: "You can buy upgrades, using points, to make your polynomial function (at the top) more profitable.",
            cost: 0,
            prereqs: ["0.1"],
            question: null,
            onBuy: () => buyUpgrade("0.2", 0)
        },
        {
            id: "0.3",
            title: "What if I want points, fast?",
            description: "Don't fret! See that button on the top left, you can gain f(x) points for every press! You will be able to earn points when you unlock upgrade #1.",
            cost: 0,
            prereqs: ["0.2"],
            question: null,
            onBuy: () => buyUpgrade("0.3", 0)
        },
        {
            id: "0.4",
            title: "And there's... more!",
            description: "You can also collect the falling function expressions to gain more points, based on the value of that expression.",
            cost: 0,
            prereqs: ["0.3"],
            question: null,
            onBuy: () => buyUpgrade("0.4", 0)
        },
        {
            id: "0.5",
            title: "But it's not so easy...",
            description: "For most upgrades, you will need to correctly answer math questions on polynomials to obtain that upgrade.\n\nIf you answer wrong, you lose points and don't get the upgrade. Good luck!",
            cost: 0,
            prereqs: ["0.4"],
            question: null,
            onBuy: () => buyUpgrade("0.5", 0)
        },
        {
            id: "1",
            title: "Constant Term",
            description: "Start generating points!\nUnlock degree 0 term: a₀ = 1.",
            cost: 0,
            prereqs: ["0.5"],
            question: "JK1",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("1", 0);
                setVariables(v => ({ ...v, a0: 1 }));
            }
        },
        {
            id: "2",
            title: "The First of Many",
            description: "Upgrade a₀ to 2.",
            cost: 30,
            prereqs: ["1"],
            question: "JA1",
            onBuy: () => {
                buyUpgrade("2", 30);
                setVariables(v => ({ ...v, a0: 2 }));
            }
        },
        {
            id: "3",
            title: "Duplication Glitch?",
            description: "Double a₀'s value!",
            cost: 100,
            prereqs: ["2"],
            question: "JK2",
            onBuy: () => {
                buyUpgrade("3", 100);
                setVariables(v => ({ ...v, a0: 4 }));
            }
        },
        {
            id: "4",
            title: "Linear Term",
            description: "Unlock degree 1 term: a₁ × x, where a₁ = 1.",
            cost: 200,
            prereqs: ["3"],
            question: "JC1",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("4", 200);
                setVariables(v => ({ ...v, a1: 1 }));
            }
        },
        {
            id: "5.1",
            title: "The First x Increase",
            description: "Upgrade x's value to 2.",
            cost: 300,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JK3",
            onBuy: () => {
                buyUpgrade("5.1", 300);
                setVariables(v => ({ ...v, x: 2 }));
            }
        },
        {
            id: "5.2",
            title: "Another Typical Increase",
            description: "Upgrade a₀'s value to 5.",
            cost: 300,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JT2",
            onBuy: () => {
                buyUpgrade("5.2", 300);
                setVariables(v => ({ ...v, a0: 5 }));
            }
        },
        {
            id: "6",
            title: "Double? No! Let's Triple!",
            description: "Triple a₀'s value.",
            cost: 1000,
            prereqs: ["5.1", "5.2"],
            question: "JK4",
            onBuy: () => {
                buyUpgrade("6", 1000);
                setVariables(v => ({ ...v, a0: 15 }));
            }
        },
        {
            id: "7.1",
            title: "Linear: Upgrade Constant",
            description: "Upgrade a₀'s value to 20.",
            cost: 2000,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JA2",
            onBuy: () => {
                buyUpgrade("7.1", 2000);
                setVariables(v => ({ ...v, a0: 20 }));
            }
        },
        {
            id: "7.2",
            title: "Linear: Upgrade Slope",
            description: "Upgrade a₁'s value to 2.",
            cost: 2000,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JK5",
            onBuy: () => {
                buyUpgrade("7.2", 2000);
                setVariables(v => ({ ...v, a1: 2 }));
            }
        },
        {
            id: "7.3",
            title: "Linear: Upgrade the Input",
            description: "Double x's value.",
            cost: 2000,
            prereqs: ["6"],
            rowGroup: 7,
            question: "JC2",
            onBuy: () => {
                buyUpgrade("7.3", 2000);
                setVariables(v => ({ ...v, x: 4 }));
            }
        },
        {
            id: "8",
            title: "Insane Increase?",
            description: "Set x's value to 10.",
            cost: 5000,
            prereqs: ["7.1", "7.2", "7.3"],
            question: "JK6",
            onBuy: () => {
                buyUpgrade("8", 5000);
                setVariables(v => ({ ...v, x: 10 }));
            }
        },
        {
            id: "9",
            title: "Quadratic Term",
            description: "Unlock degree 2 term: a₂ × x², where a₂ = 1.",
            cost: 1000,
            prereqs: ["8"],
            question: "JT1",
            isMilestone: true,
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
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6" key={upg.rowGroup}>
                    {group.map(u => (
                        <UpgradeBtn
                            key={u.id}
                            {...u}
                            boughtUpgrades={boughtUpgrades}
                            currency={currency}
                            onBuy={() => attemptBuy(u)}
                            onViewAnswer={() => viewAnswer(u.question)}
                            hasAnswer={u.question && solvedQuestions.includes(u.question)}
                            isMilestone={u.isMilestone || false}
                            isAdmin={isAdmin}
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
                        isMilestone={upg.isMilestone || false}
                        isAdmin={isAdmin}
                    />
                </div>
            );
        }
    });

    return (
        <div className="min-h-screen bg-base-100 text-base-content">
            {/* Navbar */}
            <div className="sticky top-0 z-50 navbar bg-base-200 px-2 sm:px-4 py-2 shadow-md flex items-center min-h-0">
                {/* Title */}
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <BsCaretUpSquare className="text-2xl" />
                    <span className="hidden md:inline">Polynomial<span className="text-base text-base-content"> UT</span></span>
                    <span className="hidden sm:inline md:hidden">Poly<span className="text-base text-base-content"> UT</span></span>

                    {/* Username Display */}
                    <div className="badge bg-base-content text-base-100 font-semibold hidden md:inline-flex ml-2">
                        {playerName}
                    </div>
                    <div className="badge bg-base-content text-base-100 font-semibold md:hidden ml-2">
                        {playerName.length > 8 ? playerName.substring(0, 8) + "..." : playerName}
                    </div>
                </div>

                {/* Function Display - Responsive */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-12 sm:top-2 text-sm sm:text-lg font-semibold text-base-100 bg-primary px-2 py-0.5 rounded max-w-[90vw]">
                    <div className="truncate">
                        f(x) = {(() => {
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
                    })()}
                    </div>
                </div>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    {/* Admin Controls */}
                    {isAdmin && (
                        <button
                            onClick={resetLeaderboard}
                            className="btn btn-xs sm:btn-sm btn-error ml-1 sm:ml-2"
                            title="Reset Leaderboard"
                        >
                            <span className="hidden sm:inline">Reset</span>
                            <span className="sm:hidden">🗑️</span>
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <label
                        onClick={() => playSoundEffect('click')}
                        className="toggle toggle-sm sm:toggle-md text-base-content ml-2"
                    >
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

                    {/* Audio Toggle Button */}
                    <button
                        onClick={() => {
                            playSoundEffect('click');
                            setShowAudioControls(!showAudioControls);
                        }}
                        className="btn btn-xs sm:btn-sm btn-ghost px-[0.7em] relative"
                        title={showAudioControls ? "Hide Audio Controls" : "Show Audio Controls"}
                    >
                        <div className="relative">
                            <BsMusicNoteBeamed className="text-base sm:text-lg" />
                            {isMusicPlaying && !isMuted && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse"></span>
                            )}
                            {isMuted && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full"></span>
                            )}
                        </div>
                    </button>

                    {/* Leaderboard Panel Btn */}
                    <button
                        onClick={() => {
                            playSoundEffect('click');
                            setShowLeaderboard(true);
                        }}
                        className="btn btn-xs sm:btn-sm btn-ghost px-[0.7em]"
                        title="View Leaderboard"
                    >
                        <BsTrophy className="text-base sm:text-lg" />
                    </button>

                    {/* Log Out */}
                    <button
                        onClick={() => {
                            playSoundEffect('click');
                            onLogout();
                        }}
                        className="btn btn-xs sm:btn-sm btn-ghost px-[0.7em]"
                        title="Logout"
                    >
                        <BsBoxArrowRight className="text-base sm:text-lg" />
                    </button>
                </div>
            </div>

            {/* Manual Click Button */}
            <div className="fixed top-16 left-4 z-40">
                <motion.button
                    onClick={handleManualClick}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary shadow-lg px-4 sm:px-6 py-6 sm:py-8 text-base sm:text-lg font-bold rounded-xl"
                    title="Click to earn points!"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <BsCaretUpSquare className="text-xl sm:text-2xl" />
                            <span className="whitespace-nowrap">Click: +{functionValue}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-normal opacity-90 whitespace-nowrap">
                            {Math.floor(currency)} points
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Multiplier Rain */}
            <MultiplierRain
                functionValue={functionValue}
                onCollectMultiplier={handleCollectMultiplier}
                variables={variables}
                isActive={true}
            />

            {/* Upgrade Tree */}
            <div className="my-10 sm:my-15 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                {rows}
            </div>

            {/* Stats Panel - Mobile: bottom left, Desktop: bottom left */}
            <div
                onClick={() => playSoundEffect('click')}
                className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 w-36 sm:w-56 z-40"
            >
                <div className="collapse collapse-arrow bg-base-200 shadow-lg rounded-box">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title font-semibold text-xs sm:text-sm">
                        Stats
                    </div>
                    <div className="collapse-content text-xs sm:text-sm">
                        <div>Points: {Math.floor(currency)}</div>
                        <div>Points/sec: {functionValue}</div>
                    </div>
                </div>
            </div>

            {/* Variables Panel - Mobile: bottom right, Desktop: bottom right */}
            <div
                onClick={() => playSoundEffect('click')}
                className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-36 sm:w-56 z-40"
            >
                <div className="collapse collapse-arrow bg-base-200 shadow-lg rounded-box">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title font-semibold text-xs sm:text-sm">
                        Variables
                    </div>
                    <div className="collapse-content text-xs sm:text-sm">
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

            {/* Upgrade Popup */}
            <UpgradePopup
                popup={activePopup}
                upgradeCost={pendingUpgrade?.cost}
                deductMoney={deductMoney}
                onSuccess={handleQuestionSuccess}
                onFail={handleQuestionFail}
                onClose={() => {
                    playSoundEffect('click');
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
                        onClose={() => {
                            playSoundEffect('click');
                            setReviewPopup(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Notification Popup */}
            <AnimatePresence>
                {notifications.map((notification, index) => {
                    const bottomPosition = 12 + (index * 40);

                    return (
                        <motion.div
                            key={notification.id}
                            className="fixed inset-x-0 z-[100] flex justify-center"
                            style={{
                                bottom: `${bottomPosition}px`
                            }}
                            initial={{ y: 15, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -8, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div
                                className={`px-3 py-1.5 rounded border text-sm backdrop-blur-sm ${
                                    notification.type === "success"
                                        ? "bg-base-100/90 border-success/50 text-success"
                                        : notification.type === "error"
                                            ? "bg-base-100/90 border-error/50 text-error"
                                            : notification.type === "warning"
                                                ? "bg-base-100/90 border-warning/50 text-warning"
                                                : notification.type === "info"
                                                    ? "bg-base-100/90 border-info/50 text-info"
                                                    : notification.type === "rare"
                                                        ? "bg-base-100/90 border-warning text-warning border"
                                                        : notification.type === "constant"
                                                            ? "bg-base-100/90 border-amber-300/50 text-amber-600"
                                                            : "bg-base-100/90 border-base-300 text-base-content"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    {notification.icon && (
                                        <span className="text-sm">{notification.icon}</span>
                                    )}
                                    <span>{notification.message}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Alert Confirm Popup */}
            {confirmDialog && (
                <ConfirmDialog
                    isOpen={true}
                    message={confirmDialog.message}
                    onConfirm={() => {
                        playSoundEffect('click');
                        confirmDialog.onConfirm();
                    }}
                    onCancel={() => {
                        playSoundEffect('click');
                        confirmDialog.onCancel();
                    }}
                />
            )}

            {/* Show audio controls when toggled */}
            {showAudioControls && <AudioControls />}

            {/* Leaderboard */}
            <AnimatePresence>
                {showLeaderboard && (
                    <Leaderboard
                        currentPlayer={playerName}
                        show={showLeaderboard}
                        onClose={() => {
                            playSoundEffect('click');
                            setShowLeaderboard(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function App() {
    const [playerName, setPlayerName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [savedPlayerData, setSavedPlayerData] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const saveRef = useRef(null);

    const handleLogin = async (name, admin = false, userData = null) => {
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

        if (userData) {
            setPlayerName(name);
            setSavedPlayerData(userData);
        } else {
            // Fallback - load from Supabase
            const { success, data } = await loadUserData(name);
            if (success) {
                setPlayerName(name);
                setSavedPlayerData(data);
            } else {
                // New user with defaults
                setPlayerName(name);
                setSavedPlayerData({
                    points: 0,
                    upgradeIds: [],
                    variables: { x: 1, a0: 0, a1: 0, a2: 0 },
                    solvedQuestions: []
                });
            }
        }
    };

    const handleLogout = () => {
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