import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === 'error';
    const isSuccess = type === 'success';

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div
                className={`bg-[#141417] border rounded-lg px-4 py-3 shadow-xl flex items-center gap-3 min-w-[300px] ${
                    isError
                        ? 'border-red-500/30'
                        : isSuccess
                        ? 'border-green-500/30'
                        : 'border-[#1F1F23]'
                }`}
            >
                {isError ? (
                    <AlertTriangle className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                ) : (
                    <CheckCircle className="w-[18px] h-[18px] text-green-400 flex-shrink-0" />
                )}
                <span className="text-sm text-white flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="w-5 h-5 flex items-center justify-center text-[#505058] hover:text-white transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
