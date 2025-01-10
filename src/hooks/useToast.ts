import { useState, useCallback } from 'react';
import { ToastAction } from '../components/ui/Toast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  action?: ToastAction;
}

export { ToastComponent, ToastProvider, useToast } from '../components/ui/Toast';