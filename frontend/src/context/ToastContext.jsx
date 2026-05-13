import { useCallback, useRef, useState } from "react";
import { ToastContainer } from "../components/ui/Toast.jsx";
import { ToastContext } from "./ToastContext.js";

let nextId = 0;

/**
 * ToastProvider — wraps the app and provides showToast globally.
 * Requirements: 11.1, 11.6
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [exiting, setExiting] = useState({});
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
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
    (msgOrObj, variantArg = "info") => {
      const message =
        typeof msgOrObj === "object" && msgOrObj !== null
          ? msgOrObj.message
          : msgOrObj;
      const variant =
        typeof msgOrObj === "object" && msgOrObj !== null
          ? (msgOrObj.variant ?? "info")
          : variantArg;

      const id = ++nextId;
      setToasts((prev) => {
        const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
        return [{ id, message, variant }, ...trimmed];
      });
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
        delete timersRef.current[id];
      }, 4000);
    },
    [removeToast],
  );

  const closeToast = useCallback(
    (id) => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
      removeToast(id);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} exiting={exiting} onClose={closeToast} />
    </ToastContext.Provider>
  );
}
