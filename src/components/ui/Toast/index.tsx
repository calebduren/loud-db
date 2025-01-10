import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

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
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`
        fixed top-8 left-1/2 -translate-x-1/2 z-[9999]
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
        text-white px-6 py-4 rounded-lg shadow-2xl 
        flex items-center gap-4 min-w-[300px]
        animate-in fade-in slide-in-from-top-4 duration-300
      `}
    >
      <Icon size={20} className="flex-shrink-0" strokeWidth={2.5} />
      <span className="text-base font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto hover:opacity-80 flex-shrink-0"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
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
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
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
