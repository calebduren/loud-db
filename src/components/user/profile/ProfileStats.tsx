import React from 'react';
import { Music, Heart } from 'lucide-react';

interface ProfileStatsProps {
  releasesCount: number;
  likesCount: number;
}

export function ProfileStats({ releasesCount, likesCount }: ProfileStatsProps) {
  return (
    <div className="flex gap-6">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-white/60" />
        <div>
          <p className="text-2xl font-bold">{releasesCount}</p>
          <p className="text-sm text-white/60">Releases</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-white/60" />
        <div>
          <p className="text-2xl font-bold">{likesCount}</p>
          <p className="text-sm text-white/60">Likes</p>
        </div>
      </div>
    </div>
  );
}