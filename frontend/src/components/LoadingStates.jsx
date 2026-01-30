import { Loader2 } from 'lucide-react';

/**
 * Full-page loading overlay
 */
export function PageLoader({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)] mx-auto mb-3" />
                <p className="theme-text-secondary text-sm">{message}</p>
            </div>
        </div>
    );
}

/**
 * Inline button loading spinner
 */
export function ButtonSpinner({ size = 16 }) {
    return <Loader2 size={size} className="animate-spin" />;
}

/**
 * Content placeholder with shimmer effect
 */
export function Skeleton({ className = '', variant = 'text' }) {
    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-10 w-10 rounded-full',
        card: 'h-24 w-full',
        button: 'h-10 w-24',
    };

    return (
        <div className={`animate-pulse bg-[var(--color-surface-hover)] rounded-md ${variants[variant]} ${className}`} />
    );
}

/**
 * Skeleton group for common patterns
 */
export function SkeletonGroup({ count = 3, variant = 'card' }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} variant={variant} />
            ))}
        </div>
    );
}
