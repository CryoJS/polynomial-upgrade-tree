import { useState } from "react";
import { BsCaretUpSquare } from "react-icons/bs";
import { motion } from "framer-motion";
import { verifyAdminPassword } from '../supabaseClient'; // Import the admin verification function

export default function LoginPage({ onLogin }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
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

        setLoading(true);
        setError("");

        // Admin account - check against Supabase
        if (trimmedName === "Admin") {
            try {
                const isValid = await verifyAdminPassword(password);

                if (!isValid) {
                    setError("Incorrect password for Admin");
                    setLoading(false);
                    return;
                }

                onLogin("Admin", true);
                setLoading(false);
                return;
            } catch (err) {
                console.error("Admin login error:", err);
                setError("Error connecting to server. Please try again.");
                setLoading(false);
                return;
            }
        }

        // Regular users - continue with localStorage
        // Load users from localStorage
        const users = JSON.parse(localStorage.getItem("polynomialUT_users") || "{}");

        if (users[trimmedName]) {
            // Existing user — check password
            if (users[trimmedName].password !== password) {
                setError("Incorrect password");
                setLoading(false);
                return;
            }
            onLogin(trimmedName, false);
            setLoading(false);
            return;
        } else {
            // New user — save password
            if (!password) {
                setError("Please enter a password for new account");
                setLoading(false);
                return;
            }
            users[trimmedName] = { password };
            localStorage.setItem("polynomialUT_users", JSON.stringify(users));
            onLogin(trimmedName, false);
            setLoading(false);
            return;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
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
                        disabled={loading}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered w-full"
                        placeholder="Password"
                        disabled={loading}
                    />

                    {error && (
                        <div className="alert alert-error p-3">
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Checking...
                            </>
                        ) : (
                            "✦ Play ✦"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}