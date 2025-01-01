import React from "react";

export function ProfileStatsSkeleton() {
  return (
    <div className="flex gap-8 animate-pulse">
      <div className="space-y-1">
        <div className="h-6 w-16 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
      <div className="space-y-1">
        <div className="h-6 w-16 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
    </div>
  );
}
