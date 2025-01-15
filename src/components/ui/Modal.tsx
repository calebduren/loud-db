import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent) => void;
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50" 
      onClick={handleBackdropClick}
    >
      <div className="min-h-full px-4 text-center">
        <div className="inline-block w-full text-left align-middle transition-all transform">
          <div
            className={cn(
              "relative w-full mx-auto bg-zinc-900 rounded-lg shadow-xl",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}