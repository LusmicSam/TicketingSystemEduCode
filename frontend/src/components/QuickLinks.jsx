import { FileText, Monitor, Terminal, MessageCircle, Send, Command, ExternalLink } from 'lucide-react';

/**
 * Quick Links / Resources Component
 */
export default function QuickLinks({ links = defaultLinks }) {
    return (
        <div className="card p-6">
            <h3 className="font-medium theme-text mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-primary)]" />
                Helpful Resources & Guides
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
        title: 'Student FAQs',
        description: 'Common questions & answers',
        url: 'https://drive.google.com/file/d/1D-R3yWi4l_90j0Fp9JWv6Ghc7gk-AB3j/view?usp=drivesdk',
        icon: FileText,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500'
    },
    {
        title: 'Installation Guide (Win)',
        description: 'For Windows users',
        url: 'https://drive.google.com/file/d/13JwBeZNxM3ZYfnwt4o_rWJtdjX8kDSwQ/view?usp=drivesdk',
        icon: Monitor,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600'
    },
    {
        title: 'Installation Guide (Mac)',
        description: 'For macOS users',
        url: 'https://drive.google.com/file/d/11FFfI2XpcXt3GcMGBct-P-Jn4aflZmvl/view?usp=drivesdk',
        icon: Command,
        iconBg: 'bg-gray-500/10',
        iconColor: 'text-gray-500'
    },
    {
        title: 'Installation Guide (Linux)',
        description: 'For Linux users',
        url: 'https://drive.google.com/file/d/1z59-iohe-ItdFJO0MCOeteykRGNdoUox/view?usp=drivesdk',
        icon: Terminal,
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500'
    },
    {
        title: 'Join WhatsApp Group',
        description: 'Community updates',
        url: 'https://chat.whatsapp.com/EVv2uU0seqd9F6FpjupR9w',
        icon: MessageCircle,
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500'
    },
    {
        title: 'Join Telegram Channel',
        description: 'Announcements & chat',
        url: 'https://t.me/+txl4rk2uHpczZGY9',
        icon: Send,
        iconBg: 'bg-sky-500/10',
        iconColor: 'text-sky-500'
    }
];
