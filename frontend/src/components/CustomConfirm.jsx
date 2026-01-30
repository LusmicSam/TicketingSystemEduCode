import { AlertTriangle, CheckCircle, XCircle, HelpCircle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function CustomConfirm({
    message,
    onConfirm,
    onCancel,
    type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    title
}) {
    const confirmRef = useRef(null);

    // Focus confirm button on mount
    useEffect(() => {
        confirmRef.current?.focus();
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    const configs = {
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            confirmBg: 'bg-amber-500 hover:bg-amber-600'
        },
        danger: {
            icon: XCircle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            confirmBg: 'bg-red-500 hover:bg-red-600'
        },
        info: {
            icon: HelpCircle,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            confirmBg: 'bg-blue-500 hover:bg-blue-600'
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-green-500/10',
            iconColor: 'text-green-500',
            confirmBg: 'bg-green-500 hover:bg-green-600'
        }
    };

    const config = configs[type];
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-2xl max-w-md w-full p-6 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 theme-text-muted hover:theme-text transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`${config.iconBg} p-4 rounded-full ${config.iconColor}`}>
                        <IconComponent size={32} />
                    </div>
                </div>

                {/* Title */}
                {title && (
                    <h3 className="text-lg font-semibold theme-text text-center mb-2">
                        {title}
                    </h3>
                )}

                {/* Message */}
                <p className="theme-text-secondary text-center text-sm leading-relaxed mb-6">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] theme-text font-medium transition-all border border-[var(--color-border)]"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-[var(--radius-md)] ${config.confirmBg} text-white font-medium transition-all shadow-lg active:scale-95`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
