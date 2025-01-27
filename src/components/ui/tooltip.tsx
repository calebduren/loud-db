import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
  align?: "left" | "center" | "right";
}

export function Tooltip({
  text,
  children,
  className,
  position = "bottom",
  align = "right",
}: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          "absolute",
          // Position
          position === "top" && ["-top-1 -translate-y-full", "after:top-full"],
          position === "bottom" && ["top-full mt-1", "after:bottom-full"],
          // Alignment
          align === "left" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "right" && "right-0",
          // Base styles
          "px-2 py-1.5 rounded-lg bg-[--color-gray-700] text-white font-medium text-xs",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "pointer-events-none whitespace-nowrap z-50",
          className
        )}
      >
        {text}
      </div>
    </div>
  );
}
