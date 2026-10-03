import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type: 'success', 'error', 'info'
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 5000)
 */
export default function Toast({ message, type = "info", onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5" />;
            case "error":
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case "success":
                return "bg-green-900/90 border-green-700 text-green-100";
            case "error":
                return "bg-red-900/90 border-red-700 text-red-100";
            default:
                return "bg-blue-900/90 border-blue-700 text-blue-100";
        }
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-up ${getStyles()}`}
            role="alert"
        >
            {getIcon()}
            <p className="font-medium">{message}</p>
            <button
                onClick={onClose}
                className="ml-2 hover:opacity-70 transition-opacity"
                aria-label="Close notification"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
