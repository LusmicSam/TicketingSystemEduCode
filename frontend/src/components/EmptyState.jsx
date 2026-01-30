import { Inbox, FileQuestion, Search as SearchIcon } from 'lucide-react';

export default function EmptyState({
    type = 'no-tickets',
    onAction,
    isDarkMode = true
}) {
    const configs = {
        'no-tickets': {
            icon: Inbox,
            title: 'No tickets yet',
            description: 'Create your first ticket to get started with support',
            actionLabel: 'Create Ticket',
            showAction: true
        },
        'no-results': {
            icon: SearchIcon,
            title: 'No tickets match your search',
            description: 'Try adjusting your filters or search terms',
            actionLabel: 'Clear Filters',
            showAction: true
        },
        'all-done': {
            icon: Inbox,
            title: 'All caught up!',
            description: 'No pending tickets in your queue',
            showAction: false
        },
        'inbox-empty': {
            icon: Inbox,
            title: 'No pending transfers',
            description: 'Your inbox is empty',
            showAction: false
        }
    };

    const config = configs[type];
    const IconComponent = config.icon;
    const textPrimary = isDarkMode ? 'text-slate-200' : 'text-gray-800';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-gray-500';

    return (
        <div className="text-center py-16 px-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} mb-4`}>
                <IconComponent size={32} className={textSecondary} />
            </div>
            <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
                {config.title}
            </h3>
            <p className={`${textSecondary} mb-6 max-w-md mx-auto`}>
                {config.description}
            </p>
            {config.showAction && onAction && (
                <button
                    onClick={onAction}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    {config.actionLabel}
                </button>
            )}
        </div>
    );
}
