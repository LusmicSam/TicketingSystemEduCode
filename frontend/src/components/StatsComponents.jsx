/**
 * Simple Stats Chart components for Admin Dashboard
 */

// Progress Bar with label
export function ProgressBar({ value, max, label, color = 'primary' }) {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    const colorClasses = {
        primary: 'bg-[var(--color-primary)]',
        success: 'bg-[var(--color-success)]',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="theme-text-secondary">{label}</span>
                <span className="theme-text font-medium">{value}</span>
            </div>
            <div className="h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}

// Category Breakdown (horizontal bars)
export function CategoryBreakdown({ data = [] }) {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    const colors = [
        'bg-indigo-500',
        'bg-blue-500',
        'bg-teal-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-purple-500'
    ];

    return (
        <div className="space-y-3">
            {data.map((item, i) => {
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                return (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="theme-text-secondary truncate">{item.label}</span>
                            <span className="theme-text font-medium ml-2">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                            <div
                                className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Mini stat card
export function MiniStat({ label, value, change, changeLabel }) {
    const isPositive = change >= 0;

    return (
        <div className="p-4 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)]">
            <p className="text-xs theme-text-muted uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold theme-text mt-1">{value}</p>
            {change !== undefined && (
                <p className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
                </p>
            )}
        </div>
    );
}

// Simple donut-style indicator
export function DonutIndicator({ value, max, label, color = 'primary' }) {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        primary: 'stroke-[var(--color-primary)]',
        success: 'stroke-green-500',
        warning: 'stroke-amber-500',
        error: 'stroke-red-500'
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <svg className="w-20 h-20 -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        className={colorClasses[color]}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold theme-text">{percentage.toFixed(0)}%</span>
                </div>
            </div>
            <div>
                <p className="theme-text font-medium">{value} / {max}</p>
                <p className="theme-text-muted text-sm">{label}</p>
            </div>
        </div>
    );
}
