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
      className="fixed inset-0 z-[9999] overflow-y-auto" 
      onClick={handleBackdropClick}
    >
      <div 
        className="flex min-h-full items-center justify-center p-4" 
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div 
          className={cn(
            "relative bg-background rounded-lg shadow-xl w-full border border-white/10",
            title ? "max-w-2xl" : "max-w-[1280px] h-[640px] max-h-[calc(100dvh-32px)]",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
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