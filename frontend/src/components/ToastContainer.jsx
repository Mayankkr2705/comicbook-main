import Toast from "./Toast";

/**
 * ToastContainer component to display multiple toasts
 * @param {Object} props
 * @param {Array} props.toasts - Array of toast objects
 * @param {Function} props.onRemove - Callback to remove a toast
 */
export default function ToastContainer({ toasts, onRemove }) {
    if (!toasts || toasts.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
}
