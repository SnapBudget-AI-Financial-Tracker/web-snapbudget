import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/**
 * useToast — hook to access showToast from any component.
 * Requirements: 11.1
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
