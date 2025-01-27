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
          "relative flex h-5 touch-none select-none items-center",
          className
        )}
        value={[value]}
        max={max}
        step={0.01}
        onValueChange={([newValue]) => onChange(newValue)}
        aria-label="Rating"
      >
        <Slider.Track className="relative h-1 w-full grow rounded-full bg-white/10">
          <Slider.Range className="absolute h-full rounded-full bg-[--color-loud]" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full bg-gradient-to-b from-[--color-gray-500] to-[--color-gray-700] shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-loud] disabled:pointer-events-none disabled:opacity-50 cursor-drag" />
      </Slider.Root>
      <div className="relative flex justify-between px-[7px]">
        {Array.from({ length: max + 1 }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-1.5 w-[1px] bg-white/20 mb-1.5 -mt-0.5" />
            <span className="text-[10px] text-[--color-gray-400] font-mono">
              {i}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
