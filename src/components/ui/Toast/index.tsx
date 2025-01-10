import React, { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

// Types
interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
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
}: {
  message: string;
  type: "success" | "error";
  onClose?: () => void;
  className?: string;
  fixed?: boolean;
}) {
  return (
    <div
      className={`
        toast
        ${fixed ? "toast--fixed" : ""}
        ${type === "success" ? "toast--success" : "toast--error"}
        ${className}
      `}
    >
      <span className="toast__message">{message}</span>
      {onClose && (
        <button onClick={onClose} className="toast__close">
          <X size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, message }: Omit<Toast, "id">) => {
      console.log("ToastProvider: showing toast", { type, message });
      const id = Math.random().toString(36).substr(2, 9);

      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto-remove after 5 seconds
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          fixed={true}
        />
      ))}
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
