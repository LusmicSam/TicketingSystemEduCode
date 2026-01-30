export default function TicketSkeleton({ count = 3, variant = 'ticket' }) {
    const SkeletonItem = () => (
        <div className="skeleton-item p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    {/* Status bar */}
                    <div className="w-1 h-12 skeleton rounded-full" />

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton rounded w-3/4" />
                        <div className="h-3 skeleton rounded w-1/2" />
                    </div>
                </div>

                {/* Badge */}
                <div className="h-6 w-20 skeleton rounded-full" />
            </div>
        </div>
    );

    const StatCardSkeleton = () => (
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-border)]">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <div className="h-3 w-20 skeleton rounded" />
                    <div className="h-8 w-16 skeleton rounded" />
                </div>
                <div className="w-10 h-10 skeleton rounded-[var(--radius-md)]" />
            </div>
        </div>
    );

    if (variant === 'stat') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonItem key={i} />
            ))}
        </div>
    );
}
