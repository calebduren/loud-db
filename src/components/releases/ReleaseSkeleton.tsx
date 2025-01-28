import React from 'react';

export function ReleaseSkeleton() {
  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-4">
      {/* Cover image skeleton */}
      <div className="w-full aspect-square bg-white/10 rounded animate-pulse" />
      
      {/* Title skeleton */}
      <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse" />
      
      {/* Artists skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
      </div>
      
      {/* Release info skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-16 animate-pulse" />
      </div>
    </div>
  );
}
