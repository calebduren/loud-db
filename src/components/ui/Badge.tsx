import { cn } from "@/lib/utils";

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
    <span
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
    </span>
  );
}
