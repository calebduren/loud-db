import * as React from "react";
import * as Slider from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
}

export function RatingSlider({
  value,
  onChange,
  max = 5,
  className,
}: RatingSliderProps) {
  return (
    <div className="space-y-2">
      <Slider.Root
        className={cn(
          "relative flex h-5 w-[200px] touch-none select-none items-center",
          className
        )}
        value={[value]}
        max={max}
        step={1}
        onValueChange={([newValue]) => onChange(newValue)}
        aria-label="Rating"
      >
        <Slider.Track className="relative h-1 w-full grow rounded-full bg-white/10">
          <Slider.Range className="absolute h-full rounded-full bg-[--color-loud]" />
        </Slider.Track>
        <Slider.Thumb className="block h-6 w-6 rounded-full bg-gradient-to-b from-[--color-gray-500] to-[--color-gray-700] shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-loud] disabled:pointer-events-none disabled:opacity-50" />
      </Slider.Root>
      <div className="relative w-[200px] flex justify-between px-2.5">
        {Array.from({ length: max + 1 }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-1 w-[1px] bg-white/20 mb-1.5" />
            <span className="text-[10px] text-white/40">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
