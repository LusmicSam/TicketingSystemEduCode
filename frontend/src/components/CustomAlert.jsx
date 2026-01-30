import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function CustomAlert({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400',
            textColor: 'text-green-300'
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            textColor: 'text-red-300'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-400',
            textColor: 'text-yellow-300'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-300'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Alert Modal */}
            <div className={`relative bg-slate-900/95 backdrop-blur-xl border ${borderColor} rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className={`${bgColor} p-3 rounded-xl ${iconColor}`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1 pt-1">
                        <p className={`${textColor} text-base leading-relaxed pr-6`}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Auto-close progress bar */}
                <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${iconColor} animate-[shrink_5s_linear_forwards]`}
                        style={{
                            animation: 'shrink 5s linear forwards'
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
