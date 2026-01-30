/**
 * Avatar component with color generation based on text
 */
export default function Avatar({
    name = '',
    email = '',
    size = 'md',
    className = '',
    showTooltip = false
}) {
    // Get initials from name or email
    const getInitials = () => {
        if (name) {
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.slice(0, 2).toUpperCase();
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return '??';
    };

    // Generate consistent color from string
    const getColor = () => {
        const str = name || email || 'default';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Predefined color palette for better visuals
        const colors = [
            'bg-indigo-500',
            'bg-blue-500',
            'bg-teal-500',
            'bg-emerald-500',
            'bg-amber-500',
            'bg-orange-500',
            'bg-rose-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-cyan-500'
        ];

        return colors[Math.abs(hash) % colors.length];
    };

    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl'
    };

    return (
        <div className="relative group" title={showTooltip ? (name || email) : undefined}>
            <div
                className={`${sizeClasses[size]} ${getColor()} rounded-full flex items-center justify-center text-white font-semibold shadow-sm transition-transform group-hover:scale-105 ${className}`}
            >
                {getInitials()}
            </div>

            {/* Optional tooltip */}
            {showTooltip && (name || email) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs theme-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-10">
                    {name || email}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-border)]" />
                </div>
            )}
        </div>
    );
}

// Avatar Group for showing multiple users
export function AvatarGroup({ users = [], max = 3, size = 'sm' }) {
    const visibleUsers = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className="flex -space-x-2">
            {visibleUsers.map((user, i) => (
                <Avatar
                    key={i}
                    name={user.name}
                    email={user.email}
                    size={size}
                    className="ring-2 ring-[var(--color-surface)]"
                    showTooltip
                />
            ))}
            {remaining > 0 && (
                <div className={`w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-xs font-medium theme-text-muted ring-2 ring-[var(--color-surface)]`}>
                    +{remaining}
                </div>
            )}
        </div>
    );
}
