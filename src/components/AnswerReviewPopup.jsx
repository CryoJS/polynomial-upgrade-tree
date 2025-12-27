import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function AnswerReviewPopup({ popup, onClose }) {
    if (!popup) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-base-100 rounded-lg p-6 max-w-2xl w-full shadow-lg border-2 border-primary max-h-[80vh] overflow-y-auto"
                >
                    <h2 className="text-xl font-bold mb-4">Question & Solution</h2>

                    <div className="mb-4">
                        <h3 className="font-semibold text-primary mb-2">Question:</h3>
                        <p className="mb-3">
                            <MathText text={popup.question} />
                        </p>
                    </div>

                    {popup.type === "mc" && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-primary mb-2">Options:</h3>
                            <div className="flex flex-col gap-1 ml-4">
                                {popup.options.map((opt, i) => (
                                    <div key={i} className={i === popup.correct ? "text-success font-semibold" : ""}>
                                        {i === popup.correct && "✓ "}
                                        <MathText text={opt} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {popup.type === "text" && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-primary mb-2">Answer:</h3>
                            <p className="text-success font-semibold ml-4">
                                <MathText text={popup.correct} />
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <h3 className="font-semibold text-primary mb-2">Solution:</h3>
                        <div className="bg-base-200 p-3 rounded">
                            {typeof popup.solution === "string" && popup.solution.startsWith("/") ? (
                                <img src={popup.solution} alt="Solution" className="max-w-full" />
                            ) : (
                                <MathText text={popup.solution} />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="btn btn-primary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}