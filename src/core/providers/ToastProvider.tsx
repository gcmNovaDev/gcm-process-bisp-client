'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '@/gcm-bisp/components/system/Toast';

type ToastType = 'warning' | 'error' | 'success' | '';


interface ToastContextType {
  showToast: (message: ReactNode, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<ReactNode>('');
  const [type, setType] = useState<ToastType>('');

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((newMessage: ReactNode, newType: ToastType = '', duration: number = 5000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(newMessage);
    setType(newType === '' ? '' : newType);
    setOpen(true);

    timeoutRef.current = setTimeout(() => {
      setOpen(false);
      timeoutRef.current = null;
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Renderizado del Toast Global */}
      <Toast
        open={open}
        setOpen={setOpen}
        type={type}
        className="fixed bottom-4 right-4 z-[9999]"
      >
        {message}
      </Toast>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
};
