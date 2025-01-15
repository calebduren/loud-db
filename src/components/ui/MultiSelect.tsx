import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const removeValue = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <Button
        variant="secondary"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between h-10 px-3 py-2",
          "border border-white/10 bg-white/5",
          "text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-white/40">{placeholder}</span>
          ) : (
            value.map((v) => {
              const option = options.find((o) => o.value === v);
              return option ? (
                <span
                  key={v}
                  className="bg-white/10 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {option.label}
                  <span
                    role="button"
                    onClick={(e) => removeValue(e, v)}
                    className="hover:text-white/80 cursor-pointer"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        removeValue(e as unknown as React.MouseEvent, v);
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ) : null;
            })
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-[--color-gray-800] border border-[--color-gray-700] rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer text-sm",
                  "hover:bg-white/10 transition-colors",
                  value.includes(option.value) && "bg-white/5"
                )}
                onClick={() => toggleOption(option.value)}
              >
                <div
                  className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center mr-2",
                    value.includes(option.value)
                      ? "bg-white border-white"
                      : "border-white/40"
                  )}
                >
                  {value.includes(option.value) && (
                    <Check className="w-3 h-3 text-black" />
                  )}
                </div>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
