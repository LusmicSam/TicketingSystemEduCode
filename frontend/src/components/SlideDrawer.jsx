import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * Slide-in drawer for previewing content
 */
export default function SlideDrawer({
    isOpen,
    onClose,
    title,
    children,
    position = 'right', // 'right' | 'left'
    width = 'max-w-lg'
}) {
    const drawerRef = useRef(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose?.();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const positionClasses = {
        right: 'right-0 animate-slide-in-right',
        left: 'left-0 animate-slide-in-left'
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`absolute top-0 ${positionClasses[position]} h-full ${width} w-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold theme-text">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-sm)] theme-text-muted hover:theme-text transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.25s ease-out;
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.25s ease-out;
                }
            `}</style>
        </div>
    );
}
