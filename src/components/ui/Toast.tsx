'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

/**
 * Individual toast notification component
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [exiting, onDismiss, toast.id]);

  useEffect(() => {
    // Entrance animation
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss
    const timer = setTimeout(handleDismiss, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [handleDismiss, toast.duration]);

  const typeStyles = {
    success: 'border-l-4 border-l-green-500',
    info: 'border-l-4 border-l-[#13c8ec]',
    warning: 'border-l-4 border-l-amber-500',
    error: 'border-l-4 border-l-red-500',
  };

  const iconMap = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div
      className={`bg-[#192f33] border border-[#325e67] rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm ${
        typeStyles[toast.type || 'info']
      } ${visible && !exiting ? 'toast-animate' : ''} ${exiting ? 'toast-animate exiting' : ''}`}
      onClick={handleDismiss}
      role="alert"
    >
      <span className="material-symbols-outlined text-[#92c0c9]">
        {iconMap[toast.type || 'info']}
      </span>
      <p className="text-white text-sm flex-1">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-[#92c0c9] hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined !text-lg">close</span>
      </button>
    </div>
  );
}

/**
 * Toast container for managing multiple toasts
 */
interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
