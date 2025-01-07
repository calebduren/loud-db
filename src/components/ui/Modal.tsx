import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
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
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={cn(
          "relative bg-background rounded-lg shadow-xl w-full border border-white/10",
          title ? "max-w-2xl" : "max-w-[1280px] h-[640px] max-h-[calc(100dvh-32px)]",
          className
        )}>
          {title ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Content with padding */}
              <div className="p-6">
                {children}
              </div>
            </>
          ) : (
            // Full content without padding
            children
          )}
        </div>
      </div>
    </div>
  );
}