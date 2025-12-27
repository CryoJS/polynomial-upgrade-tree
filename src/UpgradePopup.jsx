import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";

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

export default function UpgradePopup({ popup, onSuccess, onClose, deductMoney, upgradeCost, showNotification }) {
    if (!popup) return null;
    const [selected, setSelected] = useState(null);
    const isMC = popup?.type === "mc";

    const categoryColors = {
        Knowledge: "text-green-500",
        Application: "text-red-500",
        Communication: "text-blue-500",
        Thinking: "text-purple-500",
    };

    function handleSubmit() {
        if (selected == null) return;

        if (selected === popup.correct) {
            if (showNotification) showNotification("🎉 Correct. Upgrade purchased!", "success");
            onSuccess();
        } else {
            if (deductMoney && upgradeCost != null) deductMoney(upgradeCost);
            if (showNotification) showNotification("🤔 Wrong answer. Upgrade failed.", "error");
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-base-100 rounded-lg p-6 max-w-2xl w-full shadow-lg border-2 border-primary"
            >
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
                                            : "border-gray-300"
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
                        className="input input-bordered w-full mb-4"
                        placeholder="Ask a judge to review your solution, to recieve a passcode."
                    />
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
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
