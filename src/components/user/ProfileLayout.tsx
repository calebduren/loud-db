import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ProfileNav } from "./ProfileNav";
import { useAuth } from "../../contexts/AuthContext";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileHeaderSkeleton } from "./profile/ProfileHeaderSkeleton";
import { ProfileStatsSkeleton } from "./profile/ProfileStatsSkeleton";
import { useLikedReleasesByUser } from "../../hooks/useLikedReleasesByUser";
import { useUserReleases } from "../../hooks/useUserReleases";
import { useProfile } from "../../hooks/useProfile";

export function ProfileLayout() {
  const auth = useAuth();
  const location = useLocation();
  const { profile, loading: profileLoading } = useProfile(auth?.user?.id);
  const { releases: likedReleases, loading: likesLoading } =
    useLikedReleasesByUser(auth?.user?.id);
  const { count: releasesCount, loading: releasesLoading } = useUserReleases(
    auth?.user?.id
  );

  if (!auth) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <ProfileHeaderSkeleton />
          <ProfileStatsSkeleton />
        </div>
        <div className="flex gap-8">
          <div className="w-64 shrink-0">
            <ProfileNav />
          </div>
          <div className="min-h-[200px] flex-1 animate-pulse bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const showSkeletons = profileLoading || likesLoading || releasesLoading;
  const showError = !profile && !showSkeletons;

  if (showError) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {profileLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          profile && (
            <ProfileHeader
              profile={profile}
              releasesCount={releasesCount}
              likesCount={likedReleases.length}
            />
          )
        )}
        {likesLoading || releasesLoading ? (
          <ProfileStatsSkeleton />
        ) : (
          <></>
        )}
      </div>
      <div className="flex gap-8">
        <div className="w-64 shrink-0">
          <ProfileNav />
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
