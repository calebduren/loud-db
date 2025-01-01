import React from "react";

export function ReleaseListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/5 rounded-lg p-4 space-y-4 animate-pulse">
          <div className="aspect-square bg-white/10 rounded-md" />
          <div className="space-y-2">
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
