import React from 'react';

interface ProfileStatsProps {
  releasesCount: number;
  likesCount: number;
}

export function ProfileStats({ releasesCount, likesCount }: ProfileStatsProps) {
  return (
    <div className="flex gap-6">
      <div>
        <p className="text-2xl font-bold">{releasesCount}</p>
        <p className="text-sm text-white/60 font-mono uppercase">Created</p>
      </div>
      
      <div>
        <p className="text-2xl font-bold">{likesCount}</p>
        <p className="text-sm text-white/60 font-mono uppercase">Likes</p>
      </div>
    </div>
  );
}