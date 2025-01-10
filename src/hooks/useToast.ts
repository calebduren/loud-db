import { useState, useCallback } from 'react';
import { ToastAction } from '../components/ui/toast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  action?: ToastAction;
}

export { useToast } from '../components/ui/Toast';