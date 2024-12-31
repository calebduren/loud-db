import React from 'react';
import { Music } from 'lucide-react';

export function ReleaseSkeleton() {
  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-black">
      {/* Cover Image Skeleton */}
      <div className="absolute inset-0 bg-white/5 animate-pulse">
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <Music className="w-12 h-12 text-gray-800" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
        {/* Title and Artist */}
        <div className="space-y-2 mb-4">
          <div className="h-8 bg-white/10 rounded animate-pulse" />
          <div className="h-6 bg-white/10 rounded w-2/3 animate-pulse" />
        </div>

        {/* Release Info Grid */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-white/10 rounded w-16 mb-1 animate-pulse" />
              <div className="h-5 bg-white/10 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-6 bg-white/10 rounded w-20 animate-pulse" />
            <div className="h-6 bg-white/10 rounded w-24 animate-pulse" />
          </div>
          <div className="h-6 bg-white/10 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}