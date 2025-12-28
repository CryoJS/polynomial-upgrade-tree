import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const MultiplierRain = ({ functionValue, onCollectMultiplier, isActive = true }) => {
    const [multipliers, setMultipliers] = useState([]);

    // Generate a random constant (1-10)
    const generateConstant = useCallback(() => {
        const constant = Math.floor(Math.random() * 10) + 1; // 1-10
        return {
            type: 'constant',
            value: constant,
            display: constant.toString(),
            isRare: false
        };
    }, []);

    // Generate a rare f(x) multiplier (1f(x) to 100f(x))
    const generateRare = useCallback(() => {
        const coefficient = Math.floor(Math.random() * 100) + 1; // 1-100
        return {
            type: 'rare',
            coefficient: coefficient,
            display: coefficient === 1 ? 'f(x)' : `${coefficient}f(x)`,
            value: coefficient * functionValue,
            isRare: true
        };
    }, [functionValue]);

    // Create a new falling multiplier
    const createMultiplier = useCallback(() => {
        const id = Date.now() + Math.random();
        const xPosition = Math.random() * 85; // Random horizontal position (0-85%)
        const isRare = Math.random() < 0.07; // 7% chance for rare

        if (isRare) {
            const rareMultiplier = generateRare();
            return {
                id,
                ...rareMultiplier,
                xPosition,
                collected: false,
                createdAt: Date.now()
            };
        } else {
            const constantMultiplier = generateConstant();
            return {
                id,
                ...constantMultiplier,
                xPosition,
                collected: false,
                createdAt: Date.now()
            };
        }
    }, [generateConstant, generateRare]);

    // Add new multipliers periodically
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setMultipliers(prev => {
                const now = Date.now();
                // Remove particles that are too old (reached bottom)
                const filtered = prev.filter(m =>
                    !m.collected &&
                    (now - m.createdAt < 10000) // Remove after 10 seconds
                );

                // Limit number of multipliers on screen
                if (filtered.length >= 15) return filtered;

                return [...filtered, createMultiplier()];
            });
        }, 1500); // Spawn every 1.5 seconds

        return () => clearInterval(interval);
    }, [isActive, createMultiplier]);

    // Clean up collected particles
    useEffect(() => {
        const interval = setInterval(() => {
            setMultipliers(prev => prev.filter(m => !m.collected));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Handle multiplier click
    const handleMultiplierClick = (multiplier) => {
        if (multiplier.collected) return;

        // Mark as collected immediately
        setMultipliers(prev =>
            prev.map(m =>
                m.id === multiplier.id ? { ...m, collected: true } : m
            )
        );

        // Notify parent about collection
        onCollectMultiplier(multiplier, multiplier.value);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            {multipliers.map((multiplier) => (
                <motion.div
                    key={multiplier.id}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{ left: `${multiplier.xPosition}%` }}
                    initial={{
                        top: '-40px',
                        scale: 0.9,
                        opacity: multiplier.isRare ? 0.8 : 0
                    }}
                    animate={{
                        top: multiplier.collected ?
                            // FIX: Fade and expand UPWARDS (not teleport down)
                            [
                                'var(--current-top)',
                                'calc(var(--current-top) - 30px)',
                                'calc(var(--current-top) - 60px)'
                            ] :
                            '100vh',
                        scale: multiplier.collected ?
                            [1, 1.5, 2, 0] : // Expand and disappear
                            1,
                        opacity: multiplier.collected ?
                            [1, 0.7, 0.3, 0] : // Fade out
                            multiplier.isRare ? [1, 1, 1] : [0, 0.8, 0.8, 0.8]
                    }}
                    transition={{
                        duration: multiplier.collected ? 0.6 : 7 + Math.random() * 3,
                        ease: multiplier.collected ? "easeOut" : "linear"
                    }}
                    onClick={() => handleMultiplierClick(multiplier)}
                    // Store current position for collection animation
                    onUpdate={(latest) => {
                        if (latest.top && !multiplier.collected) {
                            // Store current top position as CSS variable
                            const element = document.getElementById(`multiplier-${multiplier.id}`);
                            if (element && typeof latest.top === 'string') {
                                element.style.setProperty('--current-top', latest.top);
                            }
                        }
                    }}
                >
                    {/* Set the current position as CSS variable */}
                    <div
                        id={`multiplier-${multiplier.id}`}
                        className="relative transform transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ '--current-top': '0px' }}
                    >

                        {/* Gradient border for rare items only */}
                        {multiplier.isRare && !multiplier.collected ? (
                            <div
                                className="absolute -inset-[2px] rounded-lg -z-10"
                                style={{
                                    background: 'linear-gradient(45deg, #06b6d4, #8b5cf6, #f43f5e, #06b6d4)',
                                    padding: '2px',
                                    animation: 'gradient-border 3s ease infinite'
                                }}
                            >
                                <div className="w-full h-full bg-base-100 rounded-lg"></div>
                            </div>
                        ) : null}

                        <div className={`
                            px-4 py-2 rounded-lg text-base font-bold
                            ${multiplier.isRare ?
                            // Rare: solid background
                            'bg-base-100 shadow-lg shadow-purple-500/30' :
                            // Constant: subtle
                            'bg-base-200 text-base-content border border-base-300'
                        }
                        `}>
                            <div className="flex items-center justify-center">
                                <span className={`
                                    ${multiplier.isRare ?
                                    // SOLID GRADIENT TEXT - NO TRANSPARENCY
                                    'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 font-extrabold text-lg' :
                                    'text-base-content font-semibold'
                                }
                                `}>
                                    {multiplier.display}
                                </span>
                            </div>
                        </div>

                        {/* Optional glow effect (scales with the wrapper) */}
                        {multiplier.isRare && !multiplier.collected && (
                            <div className="absolute -inset-1 -z-20 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-lg rounded-lg"></div>
                        )}

                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default MultiplierRain;