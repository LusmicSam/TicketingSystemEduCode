import { Inbox, FileQuestion, Search as SearchIcon, PlusCircle, ArrowRight } from 'lucide-react';

export default function EmptyState({
    type = 'no-tickets',
    onAction,
    isDarkMode = true
}) {
    const configs = {
        'no-tickets': {
            icon: Inbox,
            title: 'No tickets yet',
            description: 'Create your first support ticket to get started. Our team is ready to help!',
            actionLabel: 'Create Ticket',
            showAction: true,
            illustration: '📬'
        },
        'no-results': {
            icon: SearchIcon,
            title: 'No matches found',
            description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
            actionLabel: 'Clear Filters',
            showAction: true,
            illustration: '🔍'
        },
        'all-done': {
            icon: Inbox,
            title: 'All caught up!',
            description: 'You\'ve handled all your tickets. Great work!',
            showAction: false,
            illustration: '✨'
        },
        'inbox-empty': {
            icon: Inbox,
            title: 'Inbox is empty',
            description: 'No pending items in your queue right now.',
            showAction: false,
            illustration: '📭'
        }
    };

    const config = configs[type];
    const IconComponent = config.icon;

    return (
        <div className="text-center py-12 px-4 animate-fade-in">
            {/* Illustration */}
            <div className="relative inline-block mb-6">
                <div className="text-6xl mb-2 animate-bounce-subtle" style={{ animationDuration: '3s' }}>
                    {config.illustration}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-[var(--color-border)] rounded-full blur-sm opacity-50"></div>
            </div>

            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] mb-4">
                <IconComponent size={24} className="theme-text-muted" />
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold theme-text mb-2">
                {config.title}
            </h3>
            <p className="theme-text-muted text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                {config.description}
            </p>

            {/* Action Button */}
            {config.showAction && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-[var(--radius-md)] font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg group"
                >
                    <PlusCircle size={18} />
                    {config.actionLabel}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}
        </div>
    );
}
