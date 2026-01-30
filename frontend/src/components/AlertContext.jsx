import { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import Toast from './Toast';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [toasts, setToasts] = useState([]);

    const showAlert = useCallback((message, type = 'info') => {
        setAlert({ message, type });
    }, []);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    const showConfirm = useCallback((message, onConfirm, onCancel) => {
        setConfirm({ message, onConfirm, onCancel });
    }, []);

    const hideConfirm = useCallback(() => {
        setConfirm(null);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, showToast }}>
            {children}
            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
            {confirm && (
                <CustomConfirm
                    message={confirm.message}
                    onConfirm={() => {
                        confirm.onConfirm?.();
                        hideConfirm();
                    }}
                    onCancel={() => {
                        confirm.onCancel?.();
                        hideConfirm();
                    }}
                />
            )}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};
