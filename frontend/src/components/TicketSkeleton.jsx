export default function TicketSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 animate-pulse"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                            {/* Status indicator */}
                            <div className="w-2 h-12 bg-slate-700/50 rounded-full" />

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                                <div className="h-3 bg-slate-700/30 rounded w-1/2" />
                            </div>
                        </div>

                        {/* Badge */}
                        <div className="h-6 w-20 bg-slate-700/50 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
