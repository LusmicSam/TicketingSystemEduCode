import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';

/**
 * Online/Offline Status Indicator
 */
export default function ConnectionStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowBanner(true);
                setTimeout(() => setShowBanner(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (!showBanner) return null;

    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-slide-up ${isOnline
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
            {isOnline ? (
                <>
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Back online</span>
                </>
            ) : (
                <>
                    <WifiOff size={16} />
                    <span className="text-sm font-medium">You're offline</span>
                </>
            )}
        </div>
    );
}
