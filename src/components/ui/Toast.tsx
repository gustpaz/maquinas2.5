import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  content?: React.ReactNode;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  content,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <AlertCircle className="text-blue-500" size={20} />
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      flex items-center gap-3 px-4 py-3
      rounded-lg border ${backgrounds[type]} 
      ${content ? 'flex-col items-start' : ''}
      shadow-lg
      animate-slide-up
    `}>
      {icons[type]}
      <p className="text-gray-800">{message}</p>
      {content && (
        <div className="mt-2 w-full">
          {content}
        </div>
      )}
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 absolute top-2 right-2"
      >
        <X size={16} />
      </button>
    </div>
  );
};