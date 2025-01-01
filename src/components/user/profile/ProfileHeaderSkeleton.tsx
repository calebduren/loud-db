import React from "react";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-6 mb-8 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-white/10" />
      <div className="space-y-3">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="h-4 w-36 bg-white/10 rounded" />
      </div>
    </div>
  );
}
