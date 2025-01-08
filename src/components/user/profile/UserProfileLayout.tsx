import React from "react";
import { Navigate, useParams, Outlet } from "react-router-dom";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileHeaderSkeleton } from "./ProfileHeaderSkeleton";
import { useProfile } from "../../../hooks/useProfile";
import { useLikedReleasesByUser } from "../../../hooks/useLikedReleasesByUser";
import { useUserReleases } from "../../../hooks/useUserReleases";
import { useAuth } from "../../../hooks/useAuth";
import { LikedReleases } from "../LikedReleases";

export function UserProfileLayout() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { profile, loading: profileLoading } = useProfile(username);
  const { releases: likedReleases, loading: likesLoading } = useLikedReleasesByUser(profile?.id);
  const { count: releasesCount, loading: releasesLoading } = useUserReleases(profile?.id);

  console.log('UserProfileLayout State:', {
    username,
    currentUserId: currentUser?.id,
    profileId: profile?.id,
    likedReleases: likedReleases?.length,
    likesLoading,
    isOwnProfile: currentUser?.id === profile?.id,
    pathname: window.location.pathname
  });

  const isOwnProfile = currentUser?.id === profile?.id;

  if (!username) {
    return <Navigate to="/" replace />;
  }

  const showSkeletons = profileLoading || likesLoading || releasesLoading;
  const showError = !profile && !showSkeletons;

  if (showError) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">User not found</p>
      </div>
    );
  }

  return (
    <div>
      {profileLoading ? (
        <ProfileHeaderSkeleton />
      ) : (
        profile && (
          <ProfileHeader 
            profile={profile} 
            releasesCount={releasesCount}
            likesCount={likedReleases?.length ?? 0}
          />
        )
      )}

      <div className="mt-12">
        {isOwnProfile ? (
          <Outlet context={{ profile }} />
        ) : (
          <LikedReleases releases={likedReleases} loading={likesLoading} isOwnProfile={isOwnProfile} />
        )}
      </div>
    </div>
  );
}
