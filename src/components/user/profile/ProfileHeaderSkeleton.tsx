import React from "react";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-start animate-pulse mb-8">
      <div className="flex flex-row w-full items-center justify-between">
        <div className="relative w-20 h-20">
          <div className="w-full h-full rounded-full bg-white/10" />
        </div>
        {/* Edit Profile button skeleton */}
        <div className="mt-4 w-24 h-8 bg-white/10 rounded" />
      </div>

      <div className="mt-4">
        <div className="h-8 w-48 bg-white/10 rounded mb-2" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="h-6 w-16 bg-white/10 rounded" />
        </div>
      </div>

      <div className="flex gap-4 mt-4 w-full">
        <div className="bg-white/5 rounded-lg px-3 py-3 w-40">
          <div className="h-8 w-16 bg-white/10 rounded mb-1" />
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>
        <div className="rounded-lg px-3 py-3 w-40">
          <div className="h-8 w-16 bg-white/10 rounded mb-1" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}
