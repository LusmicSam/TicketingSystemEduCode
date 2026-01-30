import { X, Sparkles, Bell, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Announcement Banner - Clean & Minimal
 */
export default function AnnouncementBanner({
    announcements = defaultAnnouncements,
    onDismiss
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState([]);

    const visibleAnnouncements = announcements.filter((_, i) => !dismissed.includes(i));
    const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length];

    // Auto-rotate
    useEffect(() => {
        if (visibleAnnouncements.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [visibleAnnouncements.length]);

    if (!current || visibleAnnouncements.length === 0) return null;

    const handleDismiss = () => {
        setDismissed([...dismissed, announcements.indexOf(current)]);
        onDismiss?.(current);
    };

    const typeConfig = {
        tip: {
            bg: 'bg-[var(--color-primary-subtle)] border-[var(--color-primary)]/20',
            icon: Sparkles,
            iconColor: 'text-[var(--color-primary)]'
        },
        info: {
            bg: 'bg-blue-500/8 border-blue-500/20',
            icon: Info,
            iconColor: 'text-blue-400'
        },
        alert: {
            bg: 'bg-amber-500/8 border-amber-500/20',
            icon: AlertTriangle,
            iconColor: 'text-amber-400'
        },
        news: {
            bg: 'bg-green-500/8 border-green-500/20',
            icon: Bell,
            iconColor: 'text-green-400'
        }
    };

    const config = typeConfig[current.type] || typeConfig.tip;
    const IconComponent = config.icon;

    return (
        <div className={`${config.bg} border rounded-lg p-4 mb-6 animate-fade-in`}>
            <div className="flex items-start gap-3">
                <div className={`${config.iconColor} mt-0.5 flex-shrink-0`}>
                    <IconComponent size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="theme-text text-sm font-medium leading-snug">{current.message}</p>
                    {current.link && (
                        <a
                            href={current.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--color-primary)] text-sm font-medium hover:underline mt-2"
                        >
                            {current.link.label} <ArrowRight size={12} />
                        </a>
                    )}
                </div>
                <button
                    onClick={handleDismiss}
                    className="theme-text-muted hover:theme-text transition-colors p-1 -mr-1 flex-shrink-0"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Progress dots */}
            {visibleAnnouncements.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {visibleAnnouncements.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1 rounded-full transition-all ${i === currentIndex % visibleAnnouncements.length
                                    ? 'bg-[var(--color-primary)] w-4'
                                    : 'bg-[var(--color-border)] w-1.5'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const defaultAnnouncements = [
    {
        type: 'tip',
        message: 'Quick tip: Press Ctrl+K to search tickets, or N to create a new one instantly.'
    },
    {
        type: 'info',
        message: 'Enable WhatsApp notifications to receive instant updates when your ticket is resolved.'
    },
    {
        type: 'news',
        message: 'New: Track your ticket timeline and see real-time progress updates.'
    }
];
