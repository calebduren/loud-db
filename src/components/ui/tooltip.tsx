import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ text, children, className }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full",
          "px-2 py-1 rounded bg-zinc-800 text-white text-sm",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "pointer-events-none whitespace-nowrap",
          className
        )}
      >
        {text}
      </div>
    </div>
  );
}
