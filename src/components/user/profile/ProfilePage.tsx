import React from 'react';
import { ReleaseList } from '../../releases/ReleaseList';
import { ReleaseListSkeleton } from '../../releases/ReleaseListSkeleton';
import { useLikedReleasesByUser } from '../../../hooks/useLikedReleasesByUser';
import { useAuth } from '../../../hooks/useAuth';

export function ProfilePage() {
  const { user } = useAuth();
  const { releases: likedReleases, loading: likesLoading } = useLikedReleasesByUser(user?.id);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Liked Releases</h2>
      {likesLoading ? (
        <ReleaseListSkeleton />
      ) : likedReleases.length > 0 ? (
        <ReleaseList releases={likedReleases} />
      ) : (
        <p className="text-white/60">No liked releases yet</p>
      )}
    </div>
  );
}