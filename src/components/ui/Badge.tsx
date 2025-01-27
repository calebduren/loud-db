import React from "react";
import { cn } from "@/lib/utils";
import { QuestionMarkIcon } from "../icons/QuestionMarkIcon";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "recommended";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <div
      className={cn(
        "pill",
        {
          "pill--default": variant === "default",
          "pill--recommended": variant === "recommended",
        },
        className
      )}
    >
      {children}
      {variant === "recommended" && <QuestionMarkIcon className="ml-1" />}
    </div>
  );
}
