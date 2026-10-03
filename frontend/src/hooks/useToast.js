import { useState, useCallback } from "react";

/**
 * Custom hook for managing toast notifications
 * @returns {Object} Toast state and methods
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info", duration = 5000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback(
        (message, duration) => showToast(message, "success", duration),
        [showToast]
    );

    const showError = useCallback(
        (message, duration) => showToast(message, "error", duration),
        [showToast]
    );

    const showInfo = useCallback(
        (message, duration) => showToast(message, "info", duration),
        [showToast]
    );

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        removeToast,
    };
}
