import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'info';
    show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, type, show }) => {
    return (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-bold transition-all duration-300 z-50 flex items-center gap-2 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'} ${type === 'success' ? 'bg-teal-500' : 'bg-gray-600'}`}>
            {type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            )}
            {message}
        </div>
    );
};
