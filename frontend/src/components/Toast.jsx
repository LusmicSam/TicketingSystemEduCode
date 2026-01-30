import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: {
            bg: 'bg-green-500/90',
            icon: 'text-green-100',
            iconComponent: CheckCircle,
            progress: 'bg-green-200'
        },
        error: {
            bg: 'bg-red-500/90',
            icon: 'text-red-100',
            iconComponent: AlertCircle,
            progress: 'bg-red-200'
        },
        warning: {
            bg: 'bg-yellow-500/90',
            icon: 'text-yellow-100',
            iconComponent: AlertTriangle,
            progress: 'bg-yellow-200'
        },
        info: {
            bg: 'bg-blue-500/90',
            icon: 'text-blue-100',
            iconComponent: Info,
            progress: 'bg-blue-200'
        }
    };

    const config = colors[type];
    const IconComponent = config.iconComponent;

    return (
        <div className={`${config.bg} backdrop-blur-xl text-white px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right-5 duration-300 min-w-[300px] max-w-[400px]`}>
            <div className="flex items-center gap-3">
                <IconComponent size={20} className={config.icon} />
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="h-1 bg-white/20 mt-2 rounded-full overflow-hidden">
                <div
                    className={`h-full ${config.progress} rounded-full`}
                    style={{
                        animation: 'shrink 4s linear forwards'
                    }}
                />
            </div>
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
