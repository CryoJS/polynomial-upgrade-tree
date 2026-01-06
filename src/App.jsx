import { useState, useEffect, useRef, useCallback } from "react";
import { BsCaretUpSquare, BsTrophy, BsBoxArrowRight, BsMusicNoteBeamed, BsHandIndexThumbFill } from "react-icons/bs";
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
    const [variables, setVariables] = useState(savedPlayerData?.variables || { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 });
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
        return vars.a0
            + vars.a1 * vars.x
            + vars.a2 * vars.x ** 2
            + vars.a3 * vars.x ** 3
            + vars.a4 * vars.x ** 4
            + vars.a5 * vars.x ** 5
            + vars.a6 * vars.x ** 6
            + vars.a7 * vars.x ** 7;
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
            constant: { icon: "✨" },
            rare: { icon: "💎" }
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
            title: "But it's not so easy...",
            description: "For most upgrades, you will need to correctly answer math questions on polynomials to obtain that upgrade.",
            cost: 0,
            prereqs: ["0.2"],
            question: null,
            onBuy: () => buyUpgrade("0.3", 0)
        },
        {
            id: "0.4",
            title: "Not only that...",
            description: "If you answer wrong, you lose points and don't get the upgrade. Good luck!",
            cost: 0,
            prereqs: ["0.3"],
            question: null,
            onBuy: () => buyUpgrade("0.4", 0)
        },
        {
            id: "1",
            title: "Constant Term",
            description: "Start generating points!\nUnlock degree 0 term: a₀ = 1.",
            cost: 0,
            prereqs: ["0.4"],
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
            description: "Increases a₀'s value by 1.",
            cost: 10,
            prereqs: ["1"],
            question: "JA1",
            onBuy: () => {
                buyUpgrade("2", 10);
                setVariables(v => ({ ...v, a0: v.a0 + 1 }));
            }
        },
        {
            id: "3",
            title: "Duplication Glitch?",
            description: "Doubles a₀'s value.",
            cost: 20,
            prereqs: ["2"],
            question: "JK2",
            onBuy: () => {
                buyUpgrade("3", 20);
                setVariables(v => ({ ...v, a0: v.a0 * 2 }));
            }
        },
        {
            id: "4",
            title: "Linear Term",
            description: "Unlock degree 1 term: a₁ × x, where a₁ = 1.",
            cost: 50,
            prereqs: ["3"],
            question: "JC1",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("4", 50);
                setVariables(v => ({ ...v, a1: 1 }));
            }
        },
        {
            id: "5.1",
            title: "The First x Increase",
            description: "Doubles x's value.",
            cost: 100,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JK3",
            onBuy: () => {
                buyUpgrade("5.1", 100);
                setVariables(v => ({ ...v, x: v.x * 2 }));
            }
        },
        {
            id: "5.2",
            title: "Another Typical Increase",
            description: "Increases a₀'s value by 3.",
            cost: 100,
            prereqs: ["4"],
            rowGroup: 5,
            question: "JT2",
            onBuy: () => {
                buyUpgrade("5.2", 100);
                setVariables(v => ({ ...v, a0: v.a0 + 3 }));
            }
        },
        {
            id: "6",
            title: "Double? No! Let's Triple!",
            description: "Triples a₀'s value.",
            cost: 200,
            prereqs: ["5.1", "5.2"],
            question: "JK4",
            onBuy: () => {
                buyUpgrade("6", 200);
                setVariables(v => ({ ...v, a0: v.a0 * 3 }));
            }
        },
        {
            id: "7",
            title: "Unlock Epic Button",
            description: "Provides a button on the top left, where you can gain f(x) points for every press.",
            cost: 400,
            prereqs: ["6"],
            question: "JA2",
            isMilestone: true,
            onBuy: () => buyUpgrade("7", 400)
        },
        {
            id: "8.1",
            title: "Linear: Upgrade Constant",
            description: "Increases a₀'s value by 5.",
            cost: 1000,
            prereqs: ["7"],
            rowGroup: 8,
            question: "JK5",
            onBuy: () => {
                buyUpgrade("8.1", 1000);
                setVariables(v => ({ ...v, a0: v.a0 + 5 }));
            }
        },
        {
            id: "8.2",
            title: "Linear: Upgrade Slope",
            description: "Doubles a₁'s value.",
            cost: 1000,
            prereqs: ["7"],
            rowGroup: 8,
            question: "JC2",
            onBuy: () => {
                buyUpgrade("8.2", 1000);
                setVariables(v => ({ ...v, a1: v.a1 * 2 }));
            }
        },
        {
            id: "8.3",
            title: "Linear: Upgrade the Input",
            description: "Doubles x's value.",
            cost: 1000,
            prereqs: ["7"],
            rowGroup: 8,
            question: "JK6",
            onBuy: () => {
                buyUpgrade("8.3", 1000);
                setVariables(v => ({ ...v, x: v.x * 2 }));
            }
        },
        {
            id: "9",
            title: "Insane Increase?",
            description: "Multiplies x's value by 2.5. Don't worry, milestone soon...",
            cost: 2000,
            prereqs: ["8.1", "8.2", "8.3"],
            question: "RA1",
            onBuy: () => {
                buyUpgrade("9", 2000);
                setVariables(v => ({ ...v, x: Math.floor(v.x * 2.5) }));
            }
        },
        {
            id: "10",
            title: "Quadratic Term",
            description: "Unlock degree 2 term: a₂ × x², where a₂ = 1.",
            cost: 5000,
            prereqs: ["9"],
            question: "RK1",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("10", 5000);
                setVariables(v => ({ ...v, a2: 1 }));
            }
        },
        {
            id: "11",
            title: "Why not? Let's triple a₂!",
            description: "Triples a₂'s value.",
            cost: 6000,
            prereqs: ["10"],
            question: "RA2",
            onBuy: () => {
                buyUpgrade("11", 6000);
                setVariables(v => ({ ...v, a2: v.a2 * 3 }));
            }
        },
        {
            id: "12",
            title: "The next upgrade is going to be awesome :)",
            description: "Multiplies x's value by 1.5.",
            cost: 8000,
            prereqs: ["11"],
            question: "RK2",
            onBuy: () => {
                buyUpgrade("12", 8000);
                setVariables(v => ({ ...v, x: Math.floor(v.x * 1.5) }));
            }
        },
        {
            id: "13",
            title: "LETS MAKE IT RAIN!!!",
            description: "Unlock polynomial rain. You can now collect falling function expressions to gain points based on the value of that expression.",
            cost: 10000,
            prereqs: ["12"],
            question: "RA3",
            isMilestone: true,
            onBuy: () => buyUpgrade("13", 10000)
        },
        {
            id: "14",
            title: "Have you gotten a rare raining expression yet?",
            description: "Quadruples a₁'s value.",
            cost: 20000,
            prereqs: ["13"],
            question: "RK3",
            onBuy: () => {
                buyUpgrade("14", 20000);
                setVariables(v => ({ ...v, a1: v.a1 * 4 }));
            }
        },
        {
            id: "15.1",
            title: "First but not Forgotten",
            description: "Increases a₀'s value by 80.",
            cost: 30000,
            prereqs: ["14"],
            rowGroup: 15,
            question: "RC1",
            onBuy: () => {
                buyUpgrade("15.1", 30000);
                setVariables(v => ({ ...v, a0: v.a0 + 80 }));
            }
        },
        {
            id: "15.2",
            title: "Hmm... I'm almost out of ideas D:",
            description: "Multiplies a₂'s value by 3.33.",
            cost: 30000,
            prereqs: ["14"],
            rowGroup: 15,
            question: "RK4",
            onBuy: () => {
                buyUpgrade("15.2", 30000);
                setVariables(v => ({ ...v, a2: Math.floor(v.a2 * 3.33) }));
            }
        },
        {
            id: "16",
            title: "I guess it's time to stall...",
            description: "Increases all coefficients by 10%.",
            cost: 50000,
            prereqs: ["15.1", "15.2"],
            question: "RC2",
            onBuy: () => {
                buyUpgrade("16", 50000);
                setVariables(v => ({
                    ...v,
                    a0: Math.floor(v.a0 * 1.1),
                    a1: Math.floor(v.a1 * 1.1),
                    a2: Math.floor(v.a2 * 1.1)
                }));
            }
        },
        {
            id: "17",
            title: "Cubic Term",
            description: "Unlock degree 3 term: a₃ × x³, where a₃ = 1.",
            cost: 100000,
            prereqs: ["16"],
            question: "RK5",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("17", 100000);
                setVariables(v => ({ ...v, a3: 1 }));
            }
        },
        {
            id: "18",
            title: "Are We Really Doing This?",
            description: "Doubles a₃'s value.",
            cost: 200000,
            prereqs: ["17"],
            question: "RT1",
            onBuy: () => {
                buyUpgrade("18", 200000);
                setVariables(v => ({ ...v, a3: v.a3 * 2 }));
            }
        },
        {
            id: "19",
            title: "Input Inflation",
            description: "Multiplies x's value by 1.5.",
            cost: 300000,
            prereqs: ["18"],
            question: "RT2",
            onBuy: () => {
                buyUpgrade("19", 300000);
                setVariables(v => ({ ...v, x: Math.floor(v.x * 1.5) }));
            }
        },
        {
            id: "20",
            title: "Polynomial Hubris",
            description: "Increases a₁'s value by 15.",
            cost: 500000,
            prereqs: ["19"],
            question: "MK1",
            onBuy: () => {
                buyUpgrade("20", 500000);
                setVariables(v => ({ ...v, a1: v.a1 + 15 }));
            }
        },
        {
            id: "21",
            title: "We've Lost Control",
            description: "Triples a₂'s value.",
            cost: 1000000,
            prereqs: ["20"],
            question: "MA1",
            onBuy: () => {
                buyUpgrade("21", 1000000);
                setVariables(v => ({ ...v, a2: v.a2 * 3 }));
            }
        },
        {
            id: "22",
            title: "Quartic Term",
            description: "Unlock degree 4 term: a₄ × x⁴, where a₄ = 1.",
            cost: 10000000,
            prereqs: ["21"],
            question: "MK2",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("22", 10000000);
                setVariables(v => ({ ...v, a4: 1 }));
            }
        },
        {
            id: "23",
            title: "Fourth Power Problems",
            description: "Doubles a₄'s value. Of course!",
            cost: 42000000,
            prereqs: ["22"],
            question: "MA2",
            onBuy: () => {
                buyUpgrade("23", 42000000);
                setVariables(v => ({ ...v, a4: v.a4 * 2 }));
            }
        },
        {
            id: "24",
            title: "This Is Getting Ridiculous",
            description: "Sets x to 50. It's impressive, getting this far that is!",
            cost: 60000000,
            prereqs: ["23"],
            question: "MK3",
            onBuy: () => {
                buyUpgrade("24", 60000000);
                setVariables(v => ({ ...v, x: 50 }));
            }
        },
        {
            id: "25",
            title: "Exponential Ego",
            description: "Quadruples a₃'s value.",
            cost: 85000000,
            prereqs: ["24"],
            question: "MA3",
            onBuy: () => {
                buyUpgrade("25", 85000000);
                setVariables(v => ({ ...v, a3: v.a3 * 4 }));
            }
        },
        {
            id: "26",
            title: "There Is No Going Back",
            description: "Increases a₀'s value by 400.",
            cost: 120000000,
            prereqs: ["25"],
            question: "MK4",
            onBuy: () => {
                buyUpgrade("26", 120000000);
                setVariables(v => ({ ...v, a0: v.a0 + 400 }));
            }
        },
        {
            id: "27",
            title: "Quintic Term",
            description: "Unlock degree 5 term: a₅ × x⁵, where a₅ = 1.",
            cost: 180000000,
            prereqs: ["26"],
            question: "MC1",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("27", 180000000);
                setVariables(v => ({ ...v, a5: 1 }));
            }
        },
        {
            id: "28",
            title: "Power Creep Is Real",
            description: "Triples a₅'s value.",
            cost: 260000000,
            prereqs: ["27"],
            question: "MK5",
            onBuy: () => {
                buyUpgrade("28", 260000000);
                setVariables(v => ({ ...v, a5: v.a5 * 3 }));
            }
        },
        {
            id: "29",
            title: "Mathematical Overconfidence",
            description: "Doubles x's value.",
            cost: 500000000,
            prereqs: ["28"],
            question: "MC2",
            onBuy: () => {
                buyUpgrade("29", 500000000);
                setVariables(v => ({ ...v, x: v.x * 2 }));
            }
        },
        {
            id: "30",
            title: "This Was a Bad Idea",
            description: "Quadruples a₄'s value.",
            cost: 6000000000,
            prereqs: ["29"],
            question: null,
            onBuy: () => {
                buyUpgrade("30", 6000000000);
                setVariables(v => ({ ...v, a4: v.a4 * 4 }));
            }
        },
        {
            id: "31",
            title: "Polynomial Apocalypse",
            description: "Multiplies a₁'s value by 3.",
            cost: 8000000000,
            prereqs: ["30"],
            question: null,
            onBuy: () => {
                buyUpgrade("31", 8000000000);
                setVariables(v => ({ ...v, a1: v.a1 * 3 }));
            }
        },
        {
            id: "32",
            title: "Secret Math Society",
            description: "No question required! Increases all coefficients by 20%.",
            cost: 12000000000,
            prereqs: ["31"],
            question: "MT1",
            onBuy: () => {
                buyUpgrade("32", 12000000000);
                setVariables(v => ({
                    ...v,
                    a0: Math.floor(v.a0 * 1.2),
                    a1: Math.floor(v.a1 * 1.2),
                    a2: Math.floor(v.a2 * 1.2),
                    a3: Math.floor(v.a3 * 1.2),
                    a4: Math.floor(v.a4 * 1.2),
                    a5: Math.floor(v.a5 * 1.2)
                }));
            }
        },
        {
            id: "33",
            title: "Passive Power",
            description: "Doubles passive point generation rate.",
            cost: 20000000000,
            prereqs: ["32"],
            question: null,
            onBuy: () => {
                buyUpgrade("33", 20000000000);
                setVariables(v => ({ ...v, passiveMultiplier: v.passiveMultiplier * 2 }));
            }
        },
        {
            id: "34",
            title: "Hidden Harmony",
            description: "No question required! Multiplies x's value by 2.",
            cost: 35000000000,
            prereqs: ["33"],
            question: null,
            onBuy: () => {
                buyUpgrade("34", 35000000000);
                setVariables(v => ({ ...v, x: v.x * 2 }));
            }
        },
        {
            id: "35",
            title: "Sextic Term",
            description: "Unlock degree 6 term: a₆ × x⁶, where a₆ = 1.",
            cost: 50000000000,
            prereqs: ["34"],
            question: "MT2",
            isMilestone: true,
            onBuy: () => {
                buyUpgrade("35", 50000000000);
                setVariables(v => ({ ...v, a6: 1 }));
            }
        },
        {
            id: "36",
            title: "Quiet Quality",
            description: "No question required! Triples a₂'s value.",
            cost: 100000000000,
            prereqs: ["36"],
            question: null,
            onBuy: () => {
                buyUpgrade("35", 100000000000);
                setVariables(v => ({ ...v, a2: v.a2 * 3 }));
            }
        },
        {
            id: "37",
            title: "Silent Boost",
            description: "No question required! Increases a₆'s value by 5",
            cost: 250000000000,
            prereqs: ["36"],
            question: null,
            onBuy: () => {
                buyUpgrade("37", 250000000000);
                setVariables(v => ({ ...v, a6: v.a6 + 5 }));
            }
        },
        {
            id: "38",
            title: "The Final Term",
            description: "Good luck on this last thinking question, you'll need it...\nUnlocks seventh term, where a₇ = 1.",
            cost: 1000000000000,
            prereqs: ["37"],
            question: "JT1",
            onBuy: () => buyUpgrade("38", 1000000000000)
        },
        {
            id: "39",
            title: "Beyond Polynomials",
            description: "No question required! Doubles all coefficients",
            cost: 20000000000000,
            prereqs: ["38"],
            question: null,
            onBuy: () => {
                buyUpgrade("39", 20000000000000);
                setVariables(v => ({
                    ...v,
                    a0: v.a0 * 2,
                    a1: v.a1 * 2,
                    a2: v.a2 * 2,
                    a3: v.a3 * 2,
                    a4: v.a4 * 2,
                    a5: v.a5 * 2,
                    a6: v.a6 * 2
                }));
            }
        },
        {
            id: "40",
            title: "The End",
            description: "Multiplies x's value by 10. Thank you greatly for playing! Hope you've enjoyed the journey!",
            cost: 1000000000000000,
            prereqs: ["39"],
            question: null,
            onBuy: () => {
                buyUpgrade("40", 10000000000000);
                setVariables(v => ({ ...v, x: v.x * 10 }));
            }
        }
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
                    <div className="badge bg-base-content text-base-100 font-semibold hidden md:inline-flex px-3 ml-1">
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
            {boughtUpgrades.includes("7") && (<div className="fixed top-16 left-4 z-40">
                <motion.button
                    onClick={handleManualClick}
                    whileTap={{scale: 0.95}}
                    className="btn btn-primary shadow-lg px-2 sm:px-3 py-6 sm:py-8 text-base sm:text-lg font-bold rounded-xl"
                    title="Click to earn points!"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <BsHandIndexThumbFill/>
                            <span className="whitespace-nowrap">+{functionValue}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-normal opacity-90 whitespace-nowrap">
                            {Math.floor(currency)} points
                        </div>
                    </div>
                </motion.button>
            </div>)}

            {/* Multiplier Rain */}
            {boughtUpgrades.includes("13") && (<MultiplierRain
                functionValue={functionValue}
                onCollectMultiplier={handleCollectMultiplier}
                variables={variables}
                isActive={true}
            />)}

            {/* Upgrade Tree */}
            <div className="my-10 sm:my-15 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                {rows}
            </div>

            {/* Stats Panel */}
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

            {/* Variables Panel */}
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
                    const bottomPosition = 12 + (index * 35);

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
                                className={`px-3 py-1 rounded border text-sm backdrop-blur-sm ${
                                    notification.type === "success"
                                        ? "bg-base-100/90 border-success/50 text-success"
                                        : notification.type === "error"
                                            ? "bg-base-100/90 border-error/50 text-error"
                                            : notification.type === "warning"
                                                ? "bg-base-100/90 border-warning/50 text-warning"
                                                : notification.type === "info"
                                                    ? "bg-base-100/90 border-info/50 text-info"
                                                    : notification.type === "rare"
                                                        ? "bg-base-100/90 border-primary text-primary border"
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
                variables: { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 },
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
                    variables: { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 },
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
                    variables: { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 },
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