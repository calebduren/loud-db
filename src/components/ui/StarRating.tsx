import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
        >
          <Star
            className={cn(
              "w-4 h-4 transition-all",
              (hoverValue !== null ? star <= hoverValue : star <= value)
                ? `fill-[var(--color-loud)] text-[var(--color-loud)]`
                : "text-white/20"
            )}
          />
        </button>
      ))}
    </div>
  );
}
