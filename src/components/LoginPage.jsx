import { useState } from "react";
import { BsCaretUpSquare } from "react-icons/bs";
import { motion } from "framer-motion";

export default function LoginPage({ onLogin }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Please enter a username");
            return;
        }

        if (trimmedName.length < 2) {
            setError("Username must be at least 2 characters");
            return;
        }

        if (trimmedName.length > 20) {
            setError("Username must be less than 20 characters");
            return;
        }

        // Admin account
        if (trimmedName === "Admin") {
            if (password !== "Vast72") {
                setError("Incorrect password for Admin");
                return;
            }
            onLogin("Admin", true);
            return;
        }

        // Load users from localStorage
        const users = JSON.parse(localStorage.getItem("polynomialUT_users") || "{}");

        if (users[trimmedName]) {
            // Existing user — check password
            if (users[trimmedName].password !== password) {
                setError("Incorrect password");
                return;
            }
            onLogin(trimmedName, false);
        } else {
            // New user — save password
            if (!password) {
                setError("Please enter a password for new account");
                return;
            }
            users[trimmedName] = { password };
            localStorage.setItem("polynomialUT_users", JSON.stringify(users));
            onLogin(trimmedName, false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
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
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered w-full"
                        placeholder="Username"
                        autoFocus
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered w-full"
                        placeholder="Password"
                    />

                    {error && (
                        <label className="label">
                            <span className="label-text-alt text-error">{error}</span>
                        </label>
                    )}

                    <button onClick={handleSubmit} className="btn btn-primary w-full">
                        Start Playing
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
