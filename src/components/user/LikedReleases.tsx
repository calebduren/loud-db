import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { ReleaseList } from "../releases/ReleaseList";
import { ReleaseModal } from "../releases/ReleaseModal";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { useLikedReleases } from "../../hooks/useLikedReleases";
import { useLikedReleasesByUser } from "../../hooks/useLikedReleasesByUser";
import { PageTitle } from "../layout/PageTitle";
import { Release } from "../../types/database";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";

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
  const { user, canManageReleases } = useAuth();
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

  const [viewingRelease, setViewingRelease] = useState<Release | undefined>(
    undefined
  );
  const [editingRelease, setEditingRelease] = useState<Release | undefined>(
    undefined
  );
  const { showToast } = useToast();

  const handleDelete = async (release: Release) => {
    if (!window.confirm("Are you sure you want to delete this release?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("releases")
        .delete()
        .eq("id", release.id)
        .eq("created_by", user?.id);

      if (error) throw error;

      showToast({
        message: "Release deleted successfully",
        type: "success",
      });

      setViewingRelease(undefined);
      // Refetch likes - this will happen automatically through subscription
    } catch (error) {
      console.error("Error deleting release:", error);
      showToast({
        message: "Failed to delete release",
        type: "error",
      });
    }
  };

  if (!loading && (!releases || releases.length === 0)) {
    return (
      <div>
        {showPageTitle && (
          <PageTitle
            title="Likes"
            subtitle="You have not liked any releases yet"
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
          title="Likes"
          subtitle="Sorted by date you liked them"
          showAddRelease={isAdmin || isCreator}
          showImportPlaylist={isAdmin}
        />
      )}
      <ReleaseList
        releases={releases || []}
        loading={loading}
        onSelect={setViewingRelease}
        disableSorting={true} // Disable preference-based sorting since we want to maintain like order
      />
      {viewingRelease && (
        <ReleaseModal
          isOpen={true}
          release={viewingRelease}
          onClose={() => setViewingRelease(undefined)}
          onEdit={
            canManageReleases
              ? () => {
                  setEditingRelease(viewingRelease);
                  setViewingRelease(undefined);
                }
              : undefined
          }
          onDelete={canManageReleases ? handleDelete : undefined}
        />
      )}
      {editingRelease && (
        <ReleaseFormModal
          isOpen={true}
          release={editingRelease}
          onClose={() => setEditingRelease(undefined)}
        />
      )}
    </div>
  );
}
