import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { useUserReleases } from "../../hooks/useUserReleases";
import { ReleaseList } from "../releases/ReleaseList";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { AlertCircle } from "lucide-react";
import { ReleaseModal } from "../releases/ReleaseModal";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";
import { PageTitle } from "../layout/PageTitle";

export function CreatedReleases() {
  const { username } = useParams();
  const { user, canManageReleases } = useAuth();
  const { profile: currentProfile } = useProfile(user?.id);
  const { profile, loading: profileLoading } = useProfile(username);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | undefined>(
    undefined
  );
  const [viewingRelease, setViewingRelease] = useState<Release | undefined>(
    undefined
  );
  const loadMoreRef = useRef<() => void>();
  const { showToast } = useToast();

  const isOwnProfile = !username || currentProfile?.username === username;
  const userId = isOwnProfile ? user?.id : profile?.id;
  const {
    releases,
    loading: releasesLoading,
    error,
    refetch,
    hasMore,
  } = useUserReleases(userId);
  const loading = profileLoading || releasesLoading;

  const isAdmin = currentProfile?.role === "admin";
  const isCreator = currentProfile?.role === "creator";

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
      refetch();
    } catch (error) {
      console.error("Error deleting release:", error);
      showToast({
        message: "Failed to delete release",
        type: "error",
      });
    }
  };

  // Only show loading state on initial load
  if (loading && !releases.length) {
    return (
      <div>
        <PageTitle
          title="Submissions"
          showAddRelease={false}
          showImportPlaylist={false}
        />
        <div>
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
        title="Submissions"
        subtitle="Sorted by the submission date"
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />

      <div>
        <ReleaseList
          releases={releases || []}
          loading={loading}
          hasMore={hasMore}
          loadMore={() => loadMoreRef.current?.()}
          onSelect={setViewingRelease}
        />
      </div>

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

      {(isAdmin || isCreator) && (
        <>
          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              refetch();
            }}
          />
          <ReleaseFormModal
            isOpen={!!editingRelease}
            release={editingRelease}
            onClose={() => {
              setEditingRelease(undefined);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
