import React, { useState, useCallback } from "react";
import { useReleases } from "../../hooks/useReleases";
import { ReleaseList } from "./ReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { PageTitle } from "../layout/PageTitle";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useDeleteRelease } from "../../hooks/useDeleteRelease";
import { useToast } from "../../hooks/useToast";
import { useRecommendedReleases } from "../../hooks/useRecommendedReleases";

export function AllReleases() {
  const { releases, loading, hasMore, loadMoreRef, refetch } = useReleases();
  const recommendedReleases = useRecommendedReleases(releases);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { deleteRelease } = useDeleteRelease();
  const { showToast } = useToast();

  const isCreator = profile?.role === "creator";

  const {
    selectedTypes,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange,
  } = useReleaseFilters(recommendedReleases);

  // Subscribe to release changes
  useReleaseSubscription(refetch);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    refetch();
  }, [refetch]);

  const handleEditSuccess = useCallback(() => {
    setEditingRelease(null);
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(
    async (release: Release) => {
      const success = await deleteRelease(release.id);
      if (success) {
        showToast({
          type: "success",
          message: "Release deleted successfully",
        });
        refetch();
      } else {
        showToast({
          type: "error",
          message: "Failed to delete release",
        });
      }
    },
    [deleteRelease, refetch, showToast]
  );

  return (
    <div>
      <PageTitle
        title="New music"
        subtitle="Releases are sorted based on your preferences and likes"
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />

      <ReleaseFilters
        loading={loading}
        selectedTypes={selectedTypes}
        selectedGenres={selectedGenres}
        availableGenres={availableGenres}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
      />

      <div>
        {loading && filteredReleases.length === 0 ? (
          <ReleaseList releases={[]} loading={true} />
        ) : filteredReleases.length === 0 ? (
          <p className="text-white/60 text-sm">
            No releases match your criteria.
          </p>
        ) : (
          <ReleaseList
            releases={filteredReleases || []}
            loading={loading}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            showActions={canManageReleases}
            showWeeklyGroups={true}
            onEdit={canManageReleases ? setEditingRelease : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        )}
      </div>

      {/* Admin Modals */}
      {(isAdmin || isCreator) && (
        <>
          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />
          {editingRelease && (
            <ReleaseFormModal
              isOpen={true}
              onClose={() => setEditingRelease(null)}
              onSuccess={handleEditSuccess}
              release={editingRelease}
            />
          )}
        </>
      )}
    </div>
  );
}
