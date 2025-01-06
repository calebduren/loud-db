import React from 'react';

interface ExternalLinkArrowProps {
  className?: string;
}

export function ExternalLinkArrow({ className }: ExternalLinkArrowProps) {
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.08301 4.91309H9.91634V9.74642"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M4.08301 10.7464L8.91634 5.91309"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}
