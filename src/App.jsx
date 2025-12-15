import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsCaretUpSquare } from "react-icons/bs";

function UpgradeButton({ id, title, description, cost, prereqs, boughtUpgrades, currency, onBuy }) {
    const isBought = boughtUpgrades.includes(id);
    const prereqsMet = prereqs.every(p => boughtUpgrades.includes(p));
    const canBuy = prereqsMet && currency >= cost && !isBought;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative card w-96 bg-base-200 border-2 ${isBought ? "border-primary" : "border-gray-500"}`}
        >
            <div className="absolute top-2 left-2 bg-base-300 px-2 py-1 rounded text-xs font-bold">
                #{id}
            </div>

            <div className="card-body items-center text-center">
                <h2 style={{whiteSpace: 'pre-line'}} className="card-title">{title}</h2>
                <p style={{whiteSpace: 'pre-line'}}>{description}</p>

                <div className="card-actions justify-center mt-2">
                    {isBought ? (
                        <button className="btn btn-disabled bg-base-300 text-base-content">
                            Purchased
                        </button>
                    ) : (
                        <button
                            className={`btn ${canBuy ? "btn-success" : "btn-disabled bg-base-300 text-base-content"}`}
                            disabled={!canBuy}
                            onClick={() => onBuy(id, cost)}
                        >
                            {cost === 0 ? "Buy (Free)" : `Buy (${cost} Points)`}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function App() {
    const [currency, setCurrency] = useState(0);
    const [boughtUpgrades, setBoughtUpgrades] = useState([]);
    const [pointsPerSecond, setPointsPerSecond] = useState(0);
    const [variables, setVariables] = useState({ x: 1, a0: 0, a1: 0, a2: 0 });

    const currentTerms = [];
    let functionValue = 0;

    if (boughtUpgrades.includes(0)) {
        currentTerms.push(`${variables.a0}`);
        functionValue = variables.a0;
    }
    if (boughtUpgrades.includes(1)) {
        currentTerms.push(`${variables.a1}x`);
        functionValue = variables.a1 * variables.x + variables.a0;
    }
    if (boughtUpgrades.includes(2)) {
        currentTerms.push(`${variables.a2}x²`);
        functionValue = variables.a2 * variables.x ** 2 + variables.a1 * variables.x + variables.a0;
    }

    useEffect(() => {
        setPointsPerSecond(functionValue);
        const interval = setInterval(() => {
            setCurrency(c => c + functionValue);
        }, 1000);
        return () => clearInterval(interval);
    }, [functionValue]);

    function buyUpgrade(id, cost) {
        setCurrency(c => c - cost);
        setBoughtUpgrades(u => [...u, id]);
    }

    return (
        <div className="min-h-screen bg-base-100 text-base-content">
            {/* Navbar */}
            <div className="sticky top-0 z-50 navbar bg-base-200 px-5 py-2 shadow-md flex items-center min-h-0">
                {/* Title*/}
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <BsCaretUpSquare />
                    Polynomial<span className="text-base">UT</span>
                </div>

                {/* Function Display */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-13 sm:top-1 text-lg font-semibold text-white bg-primary px-3 py-1 rounded">
                    f(x) = {
                    (() => {
                        const terms = Object.entries(variables)
                            .filter(([key, val]) => key.startsWith("a") && val !== 0)
                            .sort((a, b) => parseInt(b[0].slice(1)) - parseInt(a[0].slice(1)))
                            .map(([key, val]) => {
                                const degree = parseInt(key.slice(1));
                                if (degree === 0) return <span key={key}>{val}</span>;
                                const coeff = val === 1 ? "" : val; // hide 1
                                return <span key={key}>{coeff}x{degree > 1 && <sup>{degree}</sup>}</span>;
                            });
                        return terms.length > 0 ? terms.reduce((prev, curr) => [prev, " + ", curr]) : "0";
                    })()
                }
                </div>

                {/* Theme Toggle (Light/Dark) */}
                <div className="ml-auto">
                    <label className="toggle text-base-content">
                        <input type="checkbox" value="dark" className="theme-controller" />
                        <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>
                        <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
                    </label>
                </div>
            </div>

            {/* Upgrade Tree */}
            <div className="my-30 p-6 flex flex-col gap-6">
                {(() => {
                    const upgrades = [
                        {id: 0, title: "Welcome to...\nPolynomial Upgrade Tree!",
                            description: "Use points, generated by your function, to buy upgrades and progress through the tree.",
                            cost: 0, prereqs: [], onBuy: () => buyUpgrade(0, 0)
                        },

                        {id: 1, title: "──⋆⋅ Constant Term ⋅⋆──",
                            description: "Start generating points!\nUnlock degree 0 term: a0, where a0 = 1.",
                            cost: 0, prereqs: [0], onBuy: () => {
                                buyUpgrade(1,0);
                                setVariables(v => ({...v, a0:1}));
                            }
                        },

                        {id: 2, title: "The First of Many",
                            description: "Upgrade a0's value to 2.",
                            cost: 3, prereqs: [1], onBuy: () => {
                                buyUpgrade(2,3);
                                setVariables(v => ({...v, a0:2}));
                            }
                        },

                        { id: 3, title: "Duplication Glitch?",
                            description: "Double a0's value!",
                            cost: 10, prereqs: [2], onBuy: () => {
                                buyUpgrade(3,10);
                                setVariables(v => ({...v, a0:4}))
                            }
                        },

                        { id: 4, title: "──⋆⋅ Linear Term ⋅⋆──",
                            description: "Unlock degree 1 term: a1 × x, where a1 = 1.",
                            cost: 20, prereqs: [3], onBuy: () => {
                                buyUpgrade(4,20);
                                setVariables(v => ({...v, a1:1}))
                            }
                        },

                        { id: 5.1, title: "The First x Increase",
                            description: "Upgrade x's value to 2.",
                            cost: 30, prereqs: [4], rowGroup: 5, onBuy: () => {
                                buyUpgrade(5.1,30);
                                setVariables(v => ({...v, x:2}))
                            }
                        },

                        { id: 5.2, title: "Another Typical Increase",
                            description: "Upgrade a0's value to 5.",
                            cost: 30, prereqs: [4], rowGroup: 5, onBuy: () => {
                                buyUpgrade(5.2,30);
                                setVariables(v => ({...v, a0:5}))
                            }
                        },

                        { id: 6, title: "Double? No! Let's Triple!",
                            description: "Triple a0's value.",
                            cost: 100, prereqs: [4], onBuy: () => {
                                buyUpgrade(6,100);
                                setVariables(v => ({...v, a0:15}))
                            }
                        },

                        { id: 7.1, title: "Linear: Upgrade Constant",
                            description: "Upgrade a0's value to 20.",
                            cost: 200, prereqs: [6], rowGroup: 6, onBuy: () => {
                                buyUpgrade(7.1,200);
                                setVariables(v => ({...v, a0:20}))
                            }
                        },

                        { id: 7.2, title: "Linear: Upgrade Slope",
                            description: "Upgrade a1's value to 2.",
                            cost: 200, prereqs: [6], rowGroup: 6, onBuy: () => {
                                buyUpgrade(7.2,200);
                                setVariables(v => ({...v, a1:2}))
                            }
                        },

                        { id: 7.3, title: "Linear: Upgrade the Input",
                            description: "Double x's value.",
                            cost: 200, prereqs: [6], rowGroup: 6, onBuy: () => {
                                buyUpgrade(7.3,200);
                                setVariables(v => ({...v, x:4}))
                            }
                        },

                        // { id: 20, title: "Quadratic Term",
                        //     description: "Unlock degree 2 term: a2 × x², where a2 = 1.",
                        //     cost: 200, prereqs: [19], onBuy: () => {
                        //         buyUpgrade(20,200);
                        //         setVariables(v => ({...v, a2:1}))
                        //     }
                        // },
                    ];

                    const rows = [];
                    const handled = new Set();

                    upgrades.forEach(upg => {
                        if (!upg.prereqs.every(p => boughtUpgrades.includes(p))) return;

                        if (upg.rowGroup != null) {
                            if (!handled.has(upg.rowGroup)) {
                                const group = upgrades.filter(u =>
                                    u.rowGroup === upg.rowGroup &&
                                    u.prereqs.every(p => boughtUpgrades.includes(p))
                                );
                                rows.push(
                                    <div className="flex justify-center gap-6" key={`row-${upg.rowGroup}`}>
                                        {group.map(u => (
                                            <UpgradeButton
                                                key={u.id}
                                                id={u.id}
                                                title={u.title}
                                                description={u.description}
                                                cost={u.cost}
                                                prereqs={u.prereqs}
                                                boughtUpgrades={boughtUpgrades}
                                                currency={currency}
                                                onBuy={u.onBuy}
                                            />
                                        ))}
                                    </div>
                                );
                                handled.add(upg.rowGroup);
                            }
                        } else {
                            rows.push(
                                <div className="flex justify-center" key={`row-${upg.id}`}>
                                    <UpgradeButton
                                        id={upg.id}
                                        title={upg.title}
                                        description={upg.description}
                                        cost={upg.cost}
                                        prereqs={upg.prereqs}
                                        boughtUpgrades={boughtUpgrades}
                                        currency={currency}
                                        onBuy={upg.onBuy}
                                    />
                                </div>
                            );
                        }
                    });

                    return rows;
                })()}
            </div>

            {/* Stats Panel */}
            <div className="fixed bottom-4 left-4 bg-base-200 card card-border p-4">
                <div className="font-semibold">Stats</div>
                <div>Points: {currency}</div>
                <div>Points/sec: {pointsPerSecond}</div>
            </div>

            {/* Variables Panel */}
            <div className="fixed bottom-4 right-4 bg-base-200 card card-border p-4">
                <div className="font-semibold">Variables</div>
                {Object.entries(variables)
                    .filter(([key, val]) => val !== 0)
                    .map(([key, val], idx, arr) => (
                        <div key={key}>
                            {key.startsWith("a") ? <>a<sub>{key.slice(1)}</sub></> : key} = {val}
                        </div>
                    ))}
            </div>
        </div>
    );
}
