import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  action?: ToastAction;
}

export function Toast({ message, type, onClose, action }: ToastProps) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      {action && (
        <button 
          onClick={action.onClick}
          className="ml-2 underline hover:no-underline"
        >
          {action.label}
        </button>
      )}
      <button onClick={onClose} className="ml-auto">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}