import React from "react";
import { ChevronDown } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { RELEASE_TYPES, RELEASE_TYPE_LABELS } from "@/constants/releases";

interface ReleaseTypeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReleaseTypeInput({ value, onChange }: ReleaseTypeInputProps) {
  const [focused, setFocused] = React.useState(false);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocused(false);
    }, 200);
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setFocused(false);
  };

  return (
    <div className="relative">
      <FormInput
        value={value ? RELEASE_TYPE_LABELS[value] : ""}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Select type"
        className="w-full pr-8"
        readOnly
      />
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />

      {focused && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 rounded-md border border-white/10 bg-[#1a1a1a] shadow-md py-1">
          {RELEASE_TYPES.map((type) => (
            <div
              key={type}
              className="px-2 py-1.5 cursor-pointer hover:bg-white/10 text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOptionClick(type);
              }}
            >
              {RELEASE_TYPE_LABELS[type]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
