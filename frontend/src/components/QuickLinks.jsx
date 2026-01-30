import { Book, ExternalLink, FileText, Video, MessageCircle } from 'lucide-react';

/**
 * Quick Links / Resources Component
 */
export default function QuickLinks({ links = defaultLinks }) {
    return (
        <div className="card p-6">
            <h3 className="font-medium theme-text mb-4 flex items-center gap-2">
                <Book size={16} className="text-[var(--color-primary)]" />
                Helpful Resources
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-all group"
                    >
                        <div className={`w-9 h-9 rounded-[var(--radius-sm)] ${link.iconBg} flex items-center justify-center ${link.iconColor}`}>
                            <link.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="theme-text text-sm font-medium truncate group-hover:text-[var(--color-primary)] transition-colors">
                                {link.title}
                            </p>
                            <p className="theme-text-muted text-xs truncate">{link.description}</p>
                        </div>
                        <ExternalLink size={14} className="theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>
        </div>
    );
}

const defaultLinks = [
    {
        title: 'Documentation',
        description: 'Learn how to use EduCode',
        url: '#',
        icon: FileText,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500'
    },
    {
        title: 'Video Tutorials',
        description: 'Step-by-step guides',
        url: '#',
        icon: Video,
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500'
    },
    {
        title: 'Community Forum',
        description: 'Connect with other learners',
        url: '#',
        icon: MessageCircle,
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500'
    },
    {
        title: 'Knowledge Base',
        description: 'Browse common solutions',
        url: '#',
        icon: Book,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500'
    }
];
