import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/brand/Logo';

// Base animated spinner with gradient
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'dots' | 'pulse' | 'orbit';
  color?: 'blue' | 'purple' | 'pink' | 'white';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  white: 'from-white to-slate-200',
};

// Default Gradient Spinner
export function LoadingSpinner({ 
  size = 'md', 
  className,
  variant = 'default',
  color = 'blue'
}: LoadingSpinnerProps) {
  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-bounce",
              size === 'xs' && "h-1 w-1",
              size === 'sm' && "h-1.5 w-1.5",
              size === 'md' && "h-2 w-2",
              size === 'lg' && "h-2.5 w-2.5",
              size === 'xl' && "h-3 w-3",
              color === 'blue' && "bg-blue-500",
              color === 'purple' && "bg-purple-500",
              color === 'pink' && "bg-pink-500",
              color === 'white' && "bg-white"
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <div className={cn(
          "rounded-full animate-ping opacity-30",
          sizeClasses[size],
          `bg-gradient-to-r ${colorClasses[color]}`
        )} />
        <div className={cn(
          "absolute rounded-full animate-pulse",
          sizeClasses[size],
          `bg-gradient-to-r ${colorClasses[color]}`
        )} />
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        {/* Outer ring */}
        <div className={cn(
          "absolute rounded-full border-2 border-transparent animate-spin",
          size === 'xs' && "h-4 w-4",
          size === 'sm' && "h-6 w-6",
          size === 'md' && "h-8 w-8",
          size === 'lg' && "h-10 w-10",
          size === 'xl' && "h-14 w-14",
          `border-t-gradient-to-r ${colorClasses[color]} border-l-gradient-to-r ${colorClasses[color]}`
        )} 
        style={{ 
          borderTopColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#ffffff',
          borderLeftColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#ffffff',
          animationDuration: '1s'
        }} />
        {/* Inner ring */}
        <div className={cn(
          "absolute rounded-full border-2 border-transparent animate-spin",
          size === 'xs' && "h-2 w-2",
          size === 'sm' && "h-3 w-3",
          size === 'md' && "h-4 w-4",
          size === 'lg' && "h-5 w-5",
          size === 'xl' && "h-8 w-8",
        )} 
        style={{ 
          borderBottomColor: color === 'blue' ? '#60a5fa' : color === 'purple' ? '#c084fc' : color === 'pink' ? '#f472b6' : '#e2e8f0',
          borderRightColor: color === 'blue' ? '#60a5fa' : color === 'purple' ? '#c084fc' : color === 'pink' ? '#f472b6' : '#e2e8f0',
          animationDuration: '0.75s',
          animationDirection: 'reverse'
        }} />
        {/* Center dot */}
        <div className={cn(
          "rounded-full",
          size === 'xs' && "h-1 w-1",
          size === 'sm' && "h-1.5 w-1.5",
          size === 'md' && "h-2 w-2",
          size === 'lg' && "h-2.5 w-2.5",
          size === 'xl' && "h-3 w-3",
          color === 'blue' && "bg-blue-500",
          color === 'purple' && "bg-purple-500",
          color === 'pink' && "bg-pink-500",
          color === 'white' && "bg-white"
        )} />
      </div>
    );
  }

  // Default gradient spinner
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        className={cn("animate-spin", sizeClasses[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color === 'blue' ? '#3b82f6' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : '#ffffff'} />
            <stop offset="100%" stopColor={color === 'blue' ? '#8b5cf6' : color === 'purple' ? '#ec4899' : color === 'pink' ? '#f472b6' : '#e2e8f0'} />
          </linearGradient>
        </defs>
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth="3"
          strokeLinecap="round"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"
        />
      </svg>
    </div>
  );
}

// Full screen loading with logo
interface LoadingScreenProps {
  text?: string;
  showLogo?: boolean;
  subtext?: string;
}

export function LoadingScreen({ 
  text = 'Loading...', 
  showLogo = true,
  subtext
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col items-center">
        {showLogo ? (
          <div className="relative mb-8">
            <LogoMark size="xl" animated className="animate-float" />
            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-3" />
            </div>
            <div className="absolute inset-0 animate-spin-reverse" style={{ animationDuration: '4s' }}>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full -translate-x-1/2 translate-y-3" />
            </div>
          </div>
        ) : (
          <LoadingSpinner size="xl" variant="orbit" className="mb-8" />
        )}
        
        <h2 className="text-2xl font-heading font-bold text-white mb-2 animate-pulse">
          {text}
        </h2>
        
        {subtext && (
          <p className="text-slate-400 text-sm animate-fade-in">{subtext}</p>
        )}
        
        {/* Progress dots */}
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading card for inline use
interface LoadingCardProps {
  text?: string;
  showLogo?: boolean;
}

export function LoadingCard({ text = 'Loading...', showLogo = false }: LoadingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
      {showLogo ? (
        <LogoMark size="lg" animated className="mb-4" />
      ) : (
        <LoadingSpinner size="lg" variant="gradient" className="mb-4" />
      )}
      <p className="text-slate-300 font-medium">{text}</p>
      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Button loader - for use inside buttons
interface ButtonLoaderProps {
  text?: string;
  size?: 'sm' | 'md';
}

export function ButtonLoader({ text, size = 'sm' }: ButtonLoaderProps) {
  return (
    <span className="flex items-center gap-2">
      <LoadingSpinner 
        size={size} 
        variant="orbit" 
        color="white"
      />
      {text && <span>{text}</span>}
    </span>
  );
}

// Skeleton loader for cards/content
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  lines?: number;
}

export function Skeleton({ className, variant = 'text', lines = 1 }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn("bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 animate-pulse", className)}>
        <div className="h-6 w-1/3 bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-700 rounded" />
          <div className="h-4 w-5/6 bg-slate-700 rounded" />
          <div className="h-4 w-4/6 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={cn("rounded-full bg-slate-700 animate-pulse", className)} />
    );
  }

  if (lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 bg-slate-700 rounded animate-pulse"
            style={{ width: `${100 - (i * 10)}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("h-4 bg-slate-700 rounded animate-pulse", className)} />
  );
}

// Content loading placeholder
export function ContentLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-1/4 bg-slate-700 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <Skeleton variant="card" className="h-64" />
    </div>
  );
}

// Page transition loader
export function PageTransitionLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="xl" variant="orbit" />
        <p className="mt-4 text-slate-300 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// Data table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-700/50">
      {Array.from({ length: columns }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-slate-700 rounded animate-pulse"
          style={{ width: `${Math.random() * 30 + 20}%`, flex: i === 0 ? 2 : 1 }}
        />
      ))}
    </div>
  );
}

// Export all loaders
export default {
  LoadingSpinner,
  LoadingScreen,
  LoadingCard,
  ButtonLoader,
  Skeleton,
  ContentLoader,
  PageTransitionLoader,
  TableRowSkeleton,
};
