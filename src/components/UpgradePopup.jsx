import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useAudio } from '../contexts/AudioContext';

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

export default function UpgradePopup({ popup, onSuccess, onFail, onClose, deductMoney, upgradeCost, showNotification }) {
    const { playSoundEffect } = useAudio();
    if (!popup) return null;
    const [selected, setSelected] = useState(null);
    const isMC = popup?.type === "mc";

    const categoryColors = {
        Knowledge: "text-green-500",
        Application: "text-red-500",
        Communication: "text-blue-500",
        Thinking: "text-purple-500",
    };

    const categoryColorsBorders = {
        Knowledge: "border-green-500",
        Application: "border-red-500",
        Communication: "border-blue-500",
        Thinking: "border-purple-500",
    };

    function handleSubmit() {
        if (selected == null) return;

        if (selected === popup.correct) {
            onSuccess(); // Success sound will be played in parent component
        } else {
            playSoundEffect('purchase-fail'); // Play fail sound for wrong answer
            if (deductMoney && upgradeCost != null) deductMoney(upgradeCost);
            if (showNotification) showNotification("🤔 Wrong answer. Upgrade failed.", "error");
            onFail(); // Call the fail handler
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2 sm:p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`bg-base-100 rounded-lg p-4 sm:p-6 shadow-lg border-2 ${categoryColorsBorders[popup.category]} w-full max-w-2xl max-h-[85vh] flex flex-col`}
            >
                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="mb-4">
                        {popup.category && (
                            <small className={`font-semibold ${categoryColors[popup.category]} mr-2 uppercase`}>
                                {popup.category}
                            </small>
                        )}
                        <h2 className="text-lg font-bold">
                            <MathText text={popup.question} />
                        </h2>
                    </div>

                    {isMC && (
                        <div className="flex flex-col gap-2">
                            {popup.options.map((opt, i) => {
                                const isSelected = selected === i;
                                return (
                                    <button
                                        key={i}
                                        className={`text-left px-3 py-2 rounded border ${
                                            isSelected
                                                ? "border-primary bg-primary/20"
                                                : "border-gray-300 hover:border-primary/50 hover:bg-primary/5 transition-colors duration-150"
                                        }`}
                                        onClick={() => setSelected(i)}
                                    >
                                        <MathText text={opt} />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!isMC && (
                        <input
                            type="text"
                            value={selected || ""}
                            onChange={e => setSelected(e.target.value)}
                            className="input input-bordered w-full mb-4 focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Ask a judge to review your solution, to receive a passcode."
                        />
                    )}
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button
                        className="btn btn-secondary btn-sm sm:btn-md"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-sm sm:btn-md"
                        onClick={handleSubmit}
                        disabled={selected == null}
                    >
                        Submit
                    </button>
                </div>
            </motion.div>
        </div>
    );
}