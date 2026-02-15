import * as React from 'react';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => onOpenChange?.(false)}
            />
            {/* Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {children}
            </div>
        </>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
    return (
        <div
            className={`bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-lg w-full ${className}`}
        >
            {children}
        </div>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
    return <div className="p-6 pb-0">{children}</div>;
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
    return (
        <h2 className={`text-xl font-semibold text-white ${className}`}>
            {children}
        </h2>
    );
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
    return (
        <p className={`text-sm text-slate-400 mt-2 ${className}`}>
            {children}
        </p>
    );
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
    return (
        <div className={`p-6 pt-4 flex justify-end gap-2 ${className}`}>
            {children}
        </div>
    );
}
