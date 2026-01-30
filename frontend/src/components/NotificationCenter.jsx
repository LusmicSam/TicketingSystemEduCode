import { Bell, X, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/**
 * Notification Center with dropdown
 */
export default function NotificationCenter({ notifications = [], onMarkRead, onClear }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'resolved': return <CheckCircle size={14} className="text-green-500" />;
            case 'progress': return <Clock size={14} className="text-amber-500" />;
            case 'new': return <MessageSquare size={14} className="text-blue-500" />;
            default: return <AlertCircle size={14} className="theme-text-muted" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const d = new Date(date);
        const diff = (now - d) / 1000; // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
            >
                <Bell size={20} className="theme-text-secondary" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-xl animate-slide-up overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                        <h3 className="font-medium theme-text">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={onClear}
                                className="text-xs text-[var(--color-primary)] hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell size={32} className="mx-auto mb-2 theme-text-muted opacity-50" />
                                <p className="theme-text-muted text-sm">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif, i) => (
                                <div
                                    key={i}
                                    onClick={() => onMarkRead?.(notif.id)}
                                    className={`px-4 py-3 hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors border-l-2 ${notif.read ? 'border-l-transparent' : 'border-l-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="theme-text text-sm font-medium truncate">{notif.title}</p>
                                            <p className="theme-text-muted text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                                            <p className="theme-text-muted text-xs mt-1">{formatTime(notif.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
