import { AlertCircle, CheckCircle, X, XCircle } from 'lucide-react';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-600 border-green-500';
            case 'error':
                return 'bg-red-600 border-red-500';
            default:
                return 'bg-blue-600 border-blue-500';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-white" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-white" />;
            default:
                return <AlertCircle className="h-5 w-5 text-white" />;
        }
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getStyles()} min-w-[300px] max-w-[400px] animate-slide-in`}
        >
            {getIcon()}
            <p className="text-white flex-1">{toast.message}</p>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
