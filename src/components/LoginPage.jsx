import { useState } from "react";
import { BsCaretUpSquare } from "react-icons/bs";
import { motion } from "framer-motion";
import { verifyAdminPassword, checkUserPassword, createNewUser, loadUserData, forceSaveUser } from '../supabaseClient';

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

        try {
            // Admin account
            if (trimmedName === "Admin") {
                console.log("👑 Attempting admin login...");

                try {
                    const isValid = await verifyAdminPassword(password);
                    console.log("🔐 Admin password validation result:", isValid);

                    if (!isValid) {
                        setError("Incorrect admin password.");
                        setLoading(false);
                        return;
                    }

                    console.log("✅ Admin login successful");
                    onLogin("Admin", true);
                    setLoading(false);
                    return;
                } catch (err) {
                    console.error("❌ Admin login error:", err);
                    setError(`Admin login failed: ${err.message}`);
                    setLoading(false);
                    return;
                }
            }

            // Regular user login/registration
            // First check if user exists
            const checkResult = await checkUserPassword(trimmedName, password);

            if (checkResult.success) {
                // Existing user - load their data
                const loadResult = await loadUserData(trimmedName);

                if (loadResult.success) {
                    onLogin(trimmedName, false, loadResult.data);
                } else {
                    setError("Failed to load user data");
                }
                setLoading(false);
                return;
            } else if (checkResult.error === 'User not found') {
                // New user - create account
                if (!password) {
                    setError("Please enter a password for new account");
                    setLoading(false);
                    return;
                }

                console.log("👤 Creating new user:", trimmedName);
                const createResult = await createNewUser(trimmedName, password);

                if (createResult.success) {
                    console.log("✅ User created, forcing initial save...");

                    // Force save initial data immediately
                    const saveResult = await forceSaveUser(trimmedName, {
                        points: 0,
                        pointsPerSec: 0,
                        upgradeIds: [],
                        variables: { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 },
                        solvedQuestions: []
                    }, password);

                    if (saveResult.success) {
                        console.log("✅ Initial save successful");
                        onLogin(trimmedName, false, {
                            points: 0,
                            upgradeIds: [],
                            variables: { x: 1, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0 },
                            solvedQuestions: []
                        });
                    } else {
                        console.error("❌ Initial save failed:", saveResult.error);
                        setError("Account created but failed to save initial data");
                    }
                } else {
                    setError(createResult.error);
                }
                setLoading(false);
                return;
            } else {
                // Incorrect password for existing user
                setError(checkResult.error);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Error connecting to server. Please try again.");
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
                                {name.trim() === "Admin" ? "Checking Admin..." : "Logging in..."}
                            </>
                        ) : (
                            "Start Playing"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}