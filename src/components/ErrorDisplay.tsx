import React from "react";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white bg-red-500/20 p-4 rounded-md">
        {message}
        <button onClick={onRetry} className="ml-4 underline hover:no-underline">
          Retry
        </button>
      </div>
    </div>
  );
}
