import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast.jsx';

/**
 * ToastContext — provides showToast({ message, variant }) globally.
 * Requirements: 11.1, 11.6
 */
const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Track which toasts are in slide-out phase
  const [exiting, setExiting] = useState({});
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    // Trigger slide-out animation, then remove after 220ms
    setExiting((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 220);
  }, []);

  const showToast = useCallback(
    ({ message, variant = 'info' }) => {
      const id = ++nextId;

      setToasts((prev) => {
        // Keep max 3 toasts — drop the oldest if at capacity
        const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
        return [{ id, message, variant }, ...trimmed];
      });

      // Auto-close after 4000ms
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
        delete timersRef.current[id];
      }, 4000);
    },
    [removeToast]
  );

  const closeToast = useCallback(
    (id) => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
      removeToast(id);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} exiting={exiting} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to access showToast from any component.
 * Requirements: 11.1
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;
