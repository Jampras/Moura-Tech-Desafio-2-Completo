import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

/**
 * Provider do sistema de notificações Toast.
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error', 6000), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

/**
 * Container que renderiza os toasts.
 */
function ToastContainer({ toasts, onRemove }) {
    const getIcon = (type) => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'success': return <CheckCircle className={`${iconClass} text-success-500`} />;
            case 'error': return <XCircle className={`${iconClass} text-danger-500`} />;
            case 'warning': return <AlertTriangle className={`${iconClass} text-warning-500`} />;
            default: return <Info className={`${iconClass} text-primary-500`} />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-success-50 border-success-200 text-success-800';
            case 'error': return 'bg-danger-50 border-danger-200 text-danger-800';
            case 'warning': return 'bg-warning-50 border-warning-200 text-warning-800';
            default: return 'bg-primary-50 border-primary-200 text-primary-800';
        }
    };

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in-right ${getStyles(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <p className="flex-1 text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

/**
 * Hook para usar o sistema de Toast.
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider');
    }
    return context;
}
