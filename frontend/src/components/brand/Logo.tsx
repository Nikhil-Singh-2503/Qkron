// Modern Logo Component with SVG animations
import { cn } from '@/lib/utils';
import { Zap, Clock, Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  variant?: 'default' | 'minimal' | 'icon-only';
}

const sizeConfig = {
  sm: { icon: 24, text: 'text-xl' },
  md: { icon: 32, text: 'text-2xl' },
  lg: { icon: 40, text: 'text-3xl' },
  xl: { icon: 48, text: 'text-4xl' },
};

// Modern SVG Logo Mark
export function LogoMark({ 
  size = 'md', 
  className,
  animated = false 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}) {
  const iconSize = sizeConfig[size].icon;
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Animated background glow */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl rounded-full animate-pulse" />
      )}
      
      {/* Main logo container */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl",
        "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
        "shadow-lg shadow-blue-500/30",
        animated && "animate-float"
      )}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="p-1"
        >
          {/* Outer ring */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.3"
            className={animated ? "animate-spin-slow" : ""}
            style={{ transformOrigin: 'center' }}
          />
          
          {/* Inner ring (opposite direction) */}
          <circle
            cx="24"
            cy="24"
            r="16"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            strokeDasharray="4 4"
            className={animated ? "animate-spin-reverse" : ""}
            style={{ transformOrigin: 'center' }}
          />
          
          {/* Center bolt */}
          <path
            d="M24 8L28 20H36L26 28L30 40L20 32L12 36L18 24L10 18H20L24 8Z"
            fill="white"
            className={animated ? "animate-pulse" : ""}
          />
          
          {/* Decorative dots */}
          <circle cx="24" cy="6" r="2" fill="white" fillOpacity="0.8" />
          <circle cx="42" cy="24" r="2" fill="white" fillOpacity="0.8" />
          <circle cx="24" cy="42" r="2" fill="white" fillOpacity="0.8" />
          <circle cx="6" cy="24" r="2" fill="white" fillOpacity="0.8" />
        </svg>
      </div>
    </div>
  );
}

// Text Logo Component
export function LogoText({ 
  size = 'md', 
  className,
  animated = false 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}) {
  return (
    <span 
      className={cn(
        "font-bold tracking-tight",
        "bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent",
        "font-heading",
        sizeConfig[size].text,
        animated && "animate-shimmer bg-[length:200%_auto]",
        className
      )}
    >
      QKron
    </span>
  );
}

// Full Logo Component (Icon + Text)
export function Logo({ 
  className, 
  size = 'md', 
  showText = true,
  animated = false,
  variant = 'default'
}: LogoProps) {
  if (variant === 'icon-only') {
    return <LogoMark size={size} className={className} animated={animated} />;
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "flex items-center justify-center rounded-lg",
          "bg-gradient-to-br from-blue-500 to-purple-600",
          "w-8 h-8"
        )}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        {showText && <LogoText size={size} />}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={size} animated={animated} />
      {showText && <LogoText size={size} animated={animated} />}
    </div>
  );
}

// Alternative Logo Variants
export function LogoAlt1({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50" />
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700">
          <Clock className="w-6 h-6 text-blue-400" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      </div>
      <LogoText size={size} />
    </div>
  );
}

export function LogoAlt2({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
          <Activity className="w-6 h-6 text-blue-400" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
        </div>
      </div>
      <div className="flex flex-col">
        <LogoText size={size} />
        <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">Task Scheduler</span>
      </div>
    </div>
  );
}

// Loading Logo Animation
export function LogoLoading({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <LogoMark size={size} animated className="animate-bounce" />
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default Logo;
