import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <svg 
      width="24" 
      height="32" 
      viewBox="0 0 24 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M3.98486 12H17C19.7614 12 22 9.76142 22 7V7C22 4.23858 19.7614 2 17 2V2C14.2386 2 12 4.23858 12 7V25C12 27.7614 9.76142 30 7 30V30C4.23858 30 2 27.7614 2 25V25C2 22.2386 4.23858 20 7 20H14C18.4183 20 22 23.5817 22 28V28" 
        stroke="currentColor" 
        strokeWidth="4"
      />
    </svg>
  );
}