import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { ReleaseList } from "../releases/ReleaseList";
import { useLikedReleases } from "../../hooks/useLikedReleases";
import { useLikedReleasesByUser } from "../../hooks/useLikedReleasesByUser";
import { PageTitle } from "../layout/PageTitle";

export function LikedReleases() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const { profile, loading: profileLoading } = useProfile(username);
  const isOwnProfile = !username || username === currentProfile?.username;

  // Get releases based on whether viewing own or other's profile
  const { releases: ownReleases, loading: ownLoading } = useLikedReleases();
  const { releases: userReleases, loading: userLoading } = useLikedReleasesByUser(profile?.id);

  const releases = isOwnProfile ? ownReleases : userReleases;
  const loading = isOwnProfile ? ownLoading : userLoading || profileLoading;

  const isAdmin = currentProfile?.role === "admin";
  const isCreator = currentProfile?.role === "creator";

  return (
    <div>
      <PageTitle 
        title={isOwnProfile ? "Your Liked Releases" : `${profile?.username}'s Liked Releases`}
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />
      <div className="px-6">
        <ReleaseList releases={releases || []} loading={loading} />
      </div>
    </div>
  );
};