import { AlertTriangle } from 'lucide-react';

export default function CustomConfirm({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Confirm Modal */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-500/10 p-4 rounded-xl text-yellow-400">
                        <AlertTriangle size={32} />
                    </div>
                </div>

                {/* Message */}
                <p className="text-slate-200 text-center text-base leading-relaxed mb-6">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all border border-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
