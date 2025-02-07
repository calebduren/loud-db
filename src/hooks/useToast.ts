import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export function useToast() {
  return {
    showToast: ({ message, type, action }: { 
      message: string; 
      type: 'success' | 'error';
      action?: ToastAction;
    }) => {
      const toastFn = type === 'success' ? toast.success : toast.error;
      
      if (action) {
        toastFn(message, {
          action: {
            label: action.label,
            onClick: action.onClick
          }
        });
      } else {
        toastFn(message);
      }
    }
  };
}