import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { BsEye } from "react-icons/bs";
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

export default function UpgradeBtn({id, title, description, cost, prereqs, boughtUpgrades, currency, onBuy, onViewAnswer, hasAnswer}) {
    const isBought = boughtUpgrades.includes(id);
    const prereqsMet = prereqs.every(p => boughtUpgrades.includes(p));
    const canBuy = prereqsMet && currency >= cost && !isBought;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative card w-50 sm:w-60 md:w-85 bg-base-200 border-2 ${
                isBought
                    ? "border-primary"
                    : canBuy
                        ? "border-gray-500"
                        : "border-red-600"
            }`}
        >
            <div className="absolute top-2 left-2 bg-base-300 px-2 py-1 rounded text-xs font-bold">
                #{id}
            </div>

            {hasAnswer && (
                <button
                    className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost"
                    onClick={onViewAnswer}
                    title="View question and solution"
                >
                    <BsEye className="text-lg" />
                </button>
            )}

            <div className="card-body items-center text-center">
                <h2 className="card-title">
                    <MathText text={title} />
                </h2>
                <p>
                    <MathText text={description} />
                </p>

                <div className="card-actions justify-center mt-2">
                    {isBought ? (
                        <button className="btn btn-disabled bg-base-300 text-base-content">
                            Purchased
                        </button>
                    ) : (
                        <button
                            className={`btn ${
                                canBuy
                                    ? "btn-success"
                                    : "btn-disabled bg-base-300 text-base-content"
                            }`}
                            disabled={!canBuy}
                            onClick={onBuy}
                        >
                            {cost === 0 ? "Buy (Free)" : `Buy (${cost} Points)`}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
