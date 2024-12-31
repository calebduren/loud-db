import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ReleaseList } from '../../releases/ReleaseList';
import { useLikedReleasesByUser } from '../../../hooks/useLikedReleasesByUser';
import { useUserReleases } from '../../../hooks/useUserReleases';
import { LoadingSpinner } from '../../LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import { useProfile } from '../../../hooks/useProfile';

export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { releases: likedReleases, loading: likesLoading } = useLikedReleasesByUser(user?.id);
  const { count: releasesCount, loading: releasesLoading } = useUserReleases(user?.id);

  if (profileLoading || likesLoading || releasesLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <ProfileHeader profile={profile} />
        <ProfileStats 
          releasesCount={releasesCount}
          likesCount={likedReleases.length}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Liked Releases</h2>
        {likedReleases.length > 0 ? (
          <ReleaseList releases={likedReleases} />
        ) : (
          <p className="text-white/60">No liked releases yet</p>
        )}
      </div>
    </div>
  );
}