import { Plus, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Floating Action Button for mobile quick actions
 */
export default function FloatingActionButton({
    onClick,
    icon: Icon = Plus,
    label = 'New',
    actions = [], // Array of { icon, label, onClick }
    className = '',
    pulse = true
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (actions.length > 0) {
            setIsOpen(!isOpen);
        } else {
            onClick?.();
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-40 md:hidden ${className}`}>
            {/* Action buttons */}
            {isOpen && actions.length > 0 && (
                <div className="absolute bottom-16 right-0 space-y-3 animate-slide-up">
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                action.onClick?.();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg rounded-full pl-4 pr-2 py-2 theme-text text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-all animate-slide-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <span>{action.label}</span>
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                                <action.icon size={18} />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Main FAB */}
            <button
                onClick={handleClick}
                className={`w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl active:scale-95 ${pulse && !isOpen ? 'animate-pulse-subtle' : ''
                    } ${isOpen ? 'rotate-45' : ''}`}
            >
                {isOpen ? <X size={24} /> : <Icon size={24} />}
            </button>

            {/* Backdrop when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <style>{`
                @keyframes pulse-subtle {
                    0%, 100% { box-shadow: 0 0 0 0 rgb(var(--color-primary-rgb) / 0.4); }
                    50% { box-shadow: 0 0 0 10px rgb(var(--color-primary-rgb) / 0); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
