import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      // Add event listener
      window.addEventListener('keydown', handleEsc);
      // Lock scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Remove event listener
      window.removeEventListener('keydown', handleEsc);
      // Restore scroll
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-background rounded-lg shadow-xl w-full max-w-[1280px] border border-white/10 h-[640px] max-h-[calc(100dvh-32px)]">
          {children}
        </div>
      </div>
    </div>
  );
}