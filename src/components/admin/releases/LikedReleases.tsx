import React from 'react';
import { ReleaseList } from '../../releases/ReleaseList';
import { useLikedReleases } from '../../../hooks/useLikedReleases';

export function LikedReleases() {
  const { releases, loading } = useLikedReleases();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Your Liked Releases</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ReleaseList releases={releases} />
      )}
    </div>
  );
}