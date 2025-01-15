import React from "react";
import { cn } from "../../lib/utils";

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({
  label,
  children,
  className,
}: FilterSectionProps) {
  return (
    <div className={cn("filter-section text-nowrap", className)}>
      <label className="filter-section__label">{label}</label>
      <div className="filter-section__content">{children}</div>
    </div>
  );
}
