import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastOptions {
  duration?: number;
  content?: React.ReactNode;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
    content?: React.ReactNode;
    duration?: number;
  } | null>(null);

  const showToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    setToast({ type, message, ...options });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          content={toast.content}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};