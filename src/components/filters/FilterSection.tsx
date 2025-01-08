import React from "react";

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
}

export function FilterSection({ label, children }: FilterSectionProps) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2 font-medium">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
