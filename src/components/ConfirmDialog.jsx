import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({ message, onConfirm, onCancel, isOpen }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-base-100 p-6 rounded-lg shadow-lg max-w-sm text-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                >
                    <div className="mb-4">{message}</div>
                    <div className="flex justify-center gap-4">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={onConfirm}
                        >
                            Yes
                        </button>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={onCancel}
                        >
                            No
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
