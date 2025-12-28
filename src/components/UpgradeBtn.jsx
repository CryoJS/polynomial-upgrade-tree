import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { BsEye, BsAward, BsKey } from "react-icons/bs";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useAudio } from '../contexts/AudioContext';
import { questionData } from '../questionData';

function MathText({ text }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const parts = text.split(/(\$[^$]+\$)/g);

        container.innerHTML = "";

        parts.forEach(part => {
            if (part.startsWith("$") && part.endsWith("$")) {
                const math = part.slice(1, -1);
                const span = document.createElement("span");
                try {
                    katex.render(math, span, { throwOnError: false });
                } catch (e) {
                    span.textContent = part;
                }
                container.appendChild(span);
            } else {
                const lines = part.split('\n');
                lines.forEach((line, idx) => {
                    container.appendChild(document.createTextNode(line));
                    if (idx < lines.length - 1) {
                        container.appendChild(document.createElement('br'));
                    }
                });
            }
        });
    }, [text]);

    return <span ref={containerRef}></span>;
}

export default function UpgradeBtn({
                                       id,
                                       title,
                                       description,
                                       cost,
                                       prereqs,
                                       boughtUpgrades,
                                       currency,
                                       onBuy,
                                       onViewAnswer,
                                       hasAnswer,
                                       isMilestone = false,
                                       question,
                                       isAdmin = false
                                   }) {
    const { playSoundEffect } = useAudio();
    const isBought = boughtUpgrades.includes(id);
    const prereqsMet = prereqs.every(p => boughtUpgrades.includes(p));
    const canBuy = prereqsMet && currency >= cost && !isBought;

    // Get passcode from questionData for code-type questions
    const getPasscode = () => {
        if (!question || !questionData[question]) return null;

        const qData = questionData[question];
        if (qData.type === "code") {
            return qData.correct; // This is the passcode from your questionData.js
        }
        return null;
    };

    const passcode = getPasscode();

    const handleBuyClick = () => {
        if (canBuy) {
            onBuy();
        } else {
            playSoundEffect('purchase-fail');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: isMilestone && !isBought ? [0, -5, 0] : 0,
            }}
            transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                y: isMilestone && !isBought ? {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                } : { duration: 0.3 }
            }}
            className={`relative bg-base-200 rounded-lg ${
                isBought ? "border-primary border-2"
                    : canBuy
                        ? isMilestone
                            ? ""
                            : "border-gray-500 border-2"
                        : "border-red-600 border-2"
            } ${isMilestone && !isBought ? "hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300" : ""}`}
        >

            {/* Show passcode for admin (if this upgrade has a code-type question) */}
            {isAdmin && passcode && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-success text-success-content px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-success-content">
                        <BsKey className="text-xs" />
                        <span>Passcode: {passcode}</span>
                    </div>
                </div>
            )}

            {/* Gradient border background for milestones */}
            {isMilestone && !isBought && canBuy && (
                <div
                    className="absolute -inset-[2px] rounded-lg -z-10"
                    style={{
                        background: 'linear-gradient(45deg, #06b6d4, #8b5cf6, #f43f5e, #06b6d4)',
                        padding: '2px',
                    }}
                >
                    <div className="w-full h-full bg-base-200 rounded-lg"></div>
                </div>
            )}

            {/* Card content container */}
            <div className="card w-50 sm:w-60 md:w-85 bg-base-200 rounded-lg relative z-0">
                {/* ID Badge with special styling for milestones */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                    isMilestone
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-500 border border-blue-500/30"
                        : "bg-base-300"
                }`}>
                    #{id}
                </div>

                {/* Eye button for viewing answer */}
                {hasAnswer && (
                    <button
                        className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost z-10"
                        onClick={onViewAnswer}
                        title="View question and solution"
                    >
                        <BsEye className="text-lg" />
                    </button>
                )}

                {/* Milestone badge */}
                {isMilestone && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <BsAward className="text-xs" />
                            <span>MILESTONE</span>
                        </div>
                    </div>
                )}

                <div className="card-body items-center text-center pt-5">
                    {/* Title */}
                    <h2 className={`card-title ${isMilestone ? "bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent" : ""}`}>
                        <MathText text={title} />
                    </h2>
                    <p>
                        <MathText text={description} />
                    </p>

                    <div className="card-actions justify-center mt-2">
                        {isBought ? (
                            <button
                                className={`btn btn-disabled ${
                                    isMilestone
                                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-500 border border-blue-500/30 font-bold"
                                        : "bg-base-300 text-base-content"
                                }`}
                            >
                                {isMilestone ? "★ Purchased ★" : "Purchased"}
                            </button>
                        ) : (
                            <button
                                className={`btn ${
                                    canBuy
                                        ? isMilestone
                                            ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white border-0 font-bold hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg hover:shadow-purple-500/30"
                                            : "btn-success"
                                        : "btn-disabled bg-base-300 text-base-content"
                                }`}
                                disabled={!canBuy}
                                onClick={handleBuyClick}
                            >
                                {cost === 0 ? "Buy (Free)" : `Buy (${cost} Points)`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}