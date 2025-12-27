import { useState } from "react";
import { BsCaretUpSquare } from "react-icons/bs";
import { motion } from "framer-motion";

export default function LoginPage({ onLogin }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Please enter a name");
            return;
        }

        if (trimmedName.length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        if (trimmedName.length > 20) {
            setError("Name must be less than 20 characters");
            return;
        }

        onLogin(trimmedName);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card bg-base-200 shadow-xl w-full max-w-md p-8"
            >
                <div className="flex items-center justify-center gap-3 mb-6">
                    <BsCaretUpSquare className="text-5xl text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-primary">
                            Polynomial<span className="text-base-content">UT</span>
                        </h1>
                        <p className="text-sm text-base-content/70">Upgrade Tree Game</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyDown}
                            className="input input-bordered w-full"
                            placeholder="Team name"
                            autoFocus
                        />
                        {error && (
                            <label className="label">
                                <span className="label-text-alt text-error">{error}</span>
                            </label>
                        )}
                    </div>

                    <button onClick={handleSubmit} className="btn btn-primary w-full">
                        Start Playing
                    </button>
                </div>
            </motion.div>
        </div>
    );
}