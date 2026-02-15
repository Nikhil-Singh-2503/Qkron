import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
            {text && (
                <p className="mt-4 text-slate-400 text-sm animate-pulse">{text}</p>
            )}
        </div>
    );
}

interface LoadingScreenProps {
    text?: string;
}

export function LoadingScreen({ text = 'Loading...' }: LoadingScreenProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="flex flex-col items-center">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20">
                        <Loader2 className="h-12 w-12 text-blue-500" />
                    </div>
                </div>
                <p className="mt-6 text-slate-300 text-lg font-medium animate-pulse">{text}</p>
                <div className="mt-2 flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

interface LoadingCardProps {
    text?: string;
}

export function LoadingCard({ text = 'Loading...' }: LoadingCardProps) {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-3 text-slate-400 text-sm">{text}</p>
            </div>
        </div>
    );
}
