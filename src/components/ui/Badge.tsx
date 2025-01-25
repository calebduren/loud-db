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
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        {
          "bg-white/10 text-white": variant === "default",
          "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white":
            variant === "recommended",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
