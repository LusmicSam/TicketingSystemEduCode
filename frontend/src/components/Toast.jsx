import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    const [progress, setProgress] = useState(100);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                handleClose();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 200);
    };

    const configs = {
        success: {
            bg: 'bg-[var(--color-success)]',
            icon: CheckCircle,
            progressBg: 'bg-white/30'
        },
        error: {
            bg: 'bg-[var(--color-error)]',
            icon: AlertCircle,
            progressBg: 'bg-white/30'
        },
        warning: {
            bg: 'bg-[var(--color-warning)]',
            icon: AlertTriangle,
            progressBg: 'bg-white/30'
        },
        info: {
            bg: 'bg-[var(--color-info)]',
            icon: Info,
            progressBg: 'bg-white/30'
        }
    };

    const config = configs[type];
    const IconComponent = config.icon;

    return (
        <div
            className={`${config.bg} text-white rounded-[var(--radius-md)] shadow-lg min-w-[320px] max-w-[400px] overflow-hidden transition-all duration-200 ${isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'
                }`}
            style={{ animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out' }}
        >
            <div className="px-4 py-3 flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                    <IconComponent size={18} />
                </div>
                <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
                <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-black/10">
                <div
                    className={`h-full ${config.progressBg} transition-all duration-50 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}
