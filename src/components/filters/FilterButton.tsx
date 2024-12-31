import React from 'react';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function FilterButton({ active, disabled, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-1 rounded-full text-sm transition-colors',
        active
          ? 'bg-white text-black'
          : 'bg-white/10 text-white hover:bg-white/20',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}