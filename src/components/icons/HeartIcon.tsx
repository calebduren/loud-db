import React from 'react';

interface HeartIconProps {
  className?: string;
  liked?: boolean;
}

export function HeartIcon({ className, liked }: HeartIconProps) {
  return (
    <svg
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.5 0.5C1.35223 0.5 0 2.17893 0 4.25C0 9.5 7 12.5 7 12.5C7 12.5 14 9.5 14 4.25C14 2.17893 12.6478 0.5 10.5 0.5C8 0.5 7 2.5 7 2.5C7 2.5 6 0.5 3.5 0.5Z"
        fill={liked ? "currentColor" : "currentColor"}
        fillOpacity={liked ? 1 : 0.3}
      />
    </svg>
  );
}
