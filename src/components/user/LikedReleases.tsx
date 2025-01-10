import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { ReleaseList } from "../releases/ReleaseList";
import { useLikedReleases } from "../../hooks/useLikedReleases";
import { useLikedReleasesByUser } from "../../hooks/useLikedReleasesByUser";
import { PageTitle } from "../layout/PageTitle";
import { Release } from "../../types/database";

interface LikedReleasesProps {
  releases?: Release[];
  loading?: boolean;
  isOwnProfile?: boolean;
}

export function LikedReleases({
  releases: propReleases,
  loading: propLoading,
  isOwnProfile: propIsOwnProfile,
}: LikedReleasesProps = {}) {
  const { username } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const { profile, loading: profileLoading } = useProfile(username);
  const isOwnProfile =
    propIsOwnProfile ?? (!username || username === currentProfile?.username);
  const showPageTitle = pathname === "/likes";

  // Get releases based on whether viewing own or other's profile
  const { releases: ownReleases, loading: ownLoading } = useLikedReleases();
  const { releases: userReleases, loading: userLoading } =
    useLikedReleasesByUser(profile?.id);

  console.log("LikedReleases Component State:", {
    propReleases,
    propLoading,
    propIsOwnProfile,
    ownReleases: ownReleases?.length,
    userReleases: userReleases?.length,
    isOwnProfile,
    username,
    currentProfileUsername: currentProfile?.username,
    profileId: profile?.id,
    pathname,
    user: user?.id,
  });

  const releases = isOwnProfile ? ownReleases : propReleases ?? userReleases;
  const loading = isOwnProfile
    ? ownLoading
    : propLoading ?? (userLoading || profileLoading);

  const isAdmin = currentProfile?.role === "admin";
  const isCreator = currentProfile?.role === "creator";

  if (!loading && (!releases || releases.length === 0)) {
    return (
      <div>
        {showPageTitle && (
          <PageTitle
            title="Your Liked Releases"
            showAddRelease={isAdmin || isCreator}
            showImportPlaylist={isAdmin}
          />
        )}
        <div className="text-center text-sm font-medium text-mono text-white/60 py-8">
          {isOwnProfile
            ? "You haven't liked any releases yet"
            : `@${profile?.username} hasn't liked any releases yet`}
        </div>
      </div>
    );
  }

  return (
    <div>
      {showPageTitle && (
        <PageTitle
          title="Your Liked Releases"
          showAddRelease={isAdmin || isCreator}
          showImportPlaylist={isAdmin}
        />
      )}
      <ReleaseList releases={releases || []} loading={loading} />
    </div>
  );
}
