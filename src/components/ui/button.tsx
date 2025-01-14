import React, { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "lg" | "icon";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "lg",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled,
  className,
  tooltip,
  children,
  ...props
}: ButtonProps) {
  const button = (
    <button
      className={cn(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        Icon && `btn--icon-${iconPosition}`,
        loading && "loading",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="btn__content">
        {Icon && <Icon className="btn__icon" aria-hidden="true" />}
        {children}
      </span>
    </button>
  );

  if (tooltip) {
    return <Tooltip text={tooltip}>{button}</Tooltip>;
  }

  return button;
}
