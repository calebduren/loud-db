import React from "react";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileHeaderSkeleton } from "./ProfileHeaderSkeleton";
import { ProfileStatsSkeleton } from "./ProfileStatsSkeleton";
import { useProfile } from "../../../hooks/useProfile";
import { useLikedReleasesByUser } from "../../../hooks/useLikedReleasesByUser";
import { useUserReleases } from "../../../hooks/useUserReleases";
import { useAuth } from "../../../hooks/useAuth";
import { ProfileNav } from "../ProfileNav";
import { LikedReleases } from "../LikedReleases";

export function UserProfileLayout() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { profile, loading: profileLoading } = useProfile(username);
  const { releases: likedReleases, loading: likesLoading } = useLikedReleasesByUser(profile?.id);
  const { count: releasesCount, loading: releasesLoading } = useUserReleases(profile?.id);

  const isOwnProfile = currentUser?.username === username;

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
      {isOwnProfile ? (
        <div className="flex gap-8">
          <div className="w-64 shrink-0">
            <ProfileNav />
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      ) : (
        <LikedReleases />
      )}
    </div>
  );
}
