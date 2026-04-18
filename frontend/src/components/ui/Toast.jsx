import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion.js';

/**
 * Variant config — colors and icons per toast type.
 * Requirements: 11.2
 */
const VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: '#ecfdf5',
    border: '#a7f3d0',
    iconColor: '#059669',
    text: '#065f46',
  },
  error: {
    icon: XCircle,
    bg: '#fff1f2',
    border: '#fecdd3',
    iconColor: '#e11d48',
    text: '#881337',
  },
  warning: {
    icon: AlertTriangle,
    bg: '#fffbeb',
    border: '#fde68a',
    iconColor: '#d97706',
    text: '#78350f',
  },
  info: {
    icon: Info,
    bg: '#eff6ff',
    border: '#bfdbfe',
    iconColor: '#2563eb',
    text: '#1e3a8a',
  },
};

/**
 * Single Toast item.
 * Requirements: 11.2, 11.3, 11.4, 11.5, 11.7
 */
function Toast({ id, message, variant = 'info', isExiting, onClose }) {
  const prefersReducedMotion = useReducedMotion();
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = config.icon;

  // Animation styles
  const getAnimationStyle = () => {
    if (prefersReducedMotion) {
      // Fallback: fade only
      return isExiting
        ? { animation: 'fadeOut 200ms ease forwards' }
        : { animation: 'fadeIn 200ms ease both' };
    }
    // Slide-in from right (300ms), slide-out to right (200ms)
    return isExiting
      ? { animation: 'toastSlideOut 200ms ease forwards' }
      : { animation: 'toastSlideIn 300ms ease both' };
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1px solid ${config.border}`,
        backgroundColor: config.bg,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        minWidth: '280px',
        maxWidth: '360px',
        pointerEvents: 'auto',
        cursor: 'default',
        ...getAnimationStyle(),
      }}
    >
      <Icon
        size={18}
        style={{ color: config.iconColor, flexShrink: 0, marginTop: '1px' }}
        aria-hidden="true"
      />
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          lineHeight: '1.5',
          color: config.text,
          fontFamily: 'var(--font-body, Inter, sans-serif)',
          fontWeight: 500,
        }}
      >
        {message}
      </span>
      <button
        onClick={() => onClose(id)}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: config.iconColor,
          opacity: 0.7,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * ToastContainer — renders up to 3 toasts, fixed top-right.
 * Receives toasts + exiting map + onClose from ToastProvider.
 * Requirements: 11.6
 */
export function ToastContainer({ toasts, exiting, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(24px); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            isExiting={!!exiting[toast.id]}
            onClose={onClose}
          />
        ))}
      </div>
    </>
  );
}

export default Toast;
