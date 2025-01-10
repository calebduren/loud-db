import React, { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

// Types
interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Component
export function ToastComponent({
  message,
  type,
  onClose,
  className = "",
  fixed = true,
  action,
}: {
  message: string;
  type: "success" | "error";
  onClose?: () => void;
  className?: string;
  fixed?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div
      className={`
        toast
        ${fixed ? "toast--fixed" : ""}
        ${type === "success" ? "toast--success" : "toast--error"}
        ${className}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="toast__message">{message}</span>
      <div className="toast__actions">
        {action && (
          <button 
            className="toast__action" 
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
          </button>
        )}
        <button 
          className="toast__close" 
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" onClick={(e) => e.stopPropagation()}>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            message={toast.message}
            type={toast.type}
            action={toast.action}
            onClose={() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
