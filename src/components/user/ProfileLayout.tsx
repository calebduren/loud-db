import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ProfileNav } from "./ProfileNav";
import { useAuth } from "../../hooks/useAuth";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileStats } from "./profile/ProfileStats";
import { ProfileHeaderSkeleton } from "./profile/ProfileHeaderSkeleton";
import { ProfileStatsSkeleton } from "./profile/ProfileStatsSkeleton";
import { useLikedReleasesByUser } from "../../hooks/useLikedReleasesByUser";
import { useUserReleases } from "../../hooks/useUserReleases";
import { useProfile } from "../../hooks/useProfile";

export function ProfileLayout() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { releases: likedReleases, loading: likesLoading } = useLikedReleasesByUser(user?.id);
  const { count: releasesCount, loading: releasesLoading } = useUserReleases(user?.id);

  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <ProfileHeaderSkeleton />
          <ProfileStatsSkeleton />
        </div>
        <ProfileNav />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const showSkeletons = profileLoading || likesLoading || releasesLoading;
  const showError = !profile && !showSkeletons;

  if (showError) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {profileLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          profile && <ProfileHeader profile={profile} />
        )}
        {likesLoading || releasesLoading ? (
          <ProfileStatsSkeleton />
        ) : (
          <ProfileStats 
            releasesCount={releasesCount}
            likesCount={likedReleases.length}
          />
        )}
      </div>
      <ProfileNav />
      <Outlet />
    </div>
  );
}
