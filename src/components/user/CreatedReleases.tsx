import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { ReleaseList } from "../releases/ReleaseList";
import { useUserReleases } from "../../hooks/useUserReleases";
import { PageTitle } from "../layout/PageTitle";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { usePermissions } from "../../hooks/usePermissions";
import { Release } from "../../types/database";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";

export function CreatedReleases() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const { profile, loading: profileLoading } = useProfile(username);
  const { canManageReleases } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  const isOwnProfile = !username || user?.username === username;
  const userId = isOwnProfile ? user?.id : profile?.id;
  const {
    releases,
    loading: releasesLoading,
    error,
    refetch,
    hasMore,
    loadMoreRef,
  } = useUserReleases(userId);
  const loading = profileLoading || releasesLoading;

  const isAdmin = currentProfile?.role === "admin";
  const isCreator = currentProfile?.role === "creator";

  // Show skeleton loading while loading
  if (!releases.length && loading) {
    return (
      <div>
        <PageTitle
          title={isOwnProfile ? "Your Created Releases" : "Created Releases"}
          showAddRelease={false}
          showImportPlaylist={false}
        />
        <div className="px-6">
          <ReleaseList releases={[]} loading={true} />
        </div>
      </div>
    );
  }

  // Check permissions after loading
  if (!canManageReleases && isOwnProfile) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={
          isOwnProfile
            ? "Your Created Releases"
            : `${profile?.username}'s Created Releases`
        }
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />

      <div className="px-6">
        <ReleaseList
          releases={releases || []}
          loading={loading}
          showActions={isAdmin || isCreator}
          onEdit={isOwnProfile ? setEditingRelease : undefined}
          hasMore={hasMore}
          loadMoreRef={loadMoreRef}
        />
      </div>

      {(isAdmin || isCreator) && (
        <>
          {isCreateModalOpen && (
            <ReleaseFormModal
              onClose={() => {
                setIsCreateModalOpen(false);
                refetch();
              }}
            />
          )}
          {editingRelease && (
            <ReleaseFormModal
              release={editingRelease}
              onClose={() => {
                setEditingRelease(null);
                refetch();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
