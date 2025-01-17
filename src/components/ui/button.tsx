import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "lg" | "icon";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  tooltip?: string;
  disabled?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "lg",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled,
  className,
  tooltip,
  href,
  children,
  ...props
}: ButtonProps) {
  const Comp = href ? "a" : "button";
  const content = (
    <span className="btn__content">
      {Icon && <Icon className="btn__icon" aria-hidden="true" />}
      {children}
    </span>
  );

  const buttonElement = (
    <Comp
      className={cn(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        Icon && `btn--icon-${iconPosition}`,
        loading && "loading",
        className
      )}
      disabled={disabled || loading}
      href={href}
      {...(props as any)}
    >
      {content}
    </Comp>
  );

  if (tooltip) {
    return <Tooltip text={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
}
