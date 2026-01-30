import { RefreshCw } from 'lucide-react';

/**
 * Pull-to-refresh style button for refreshing data
 */
export default function RefreshButton({ onClick, isLoading = false, className = '' }) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-text ${className}`}
        >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
    );
}
