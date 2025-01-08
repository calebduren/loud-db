import React, { useState, useCallback } from "react";
import { ReleaseList } from "./ReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";
import { PageTitle } from "../layout/PageTitle";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useDeleteRelease } from "../../hooks/useDeleteRelease";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/button";

export function AllReleases() {
  const {
    selectedTypes,
    selectedGenres,
    availableGenres,
    filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMoreRef,
    refetch,
    loadMore,
    handleTypeChange,
    handleGenreChange,
    genreFilterMode,
    handleGenreFilterModeChange,
  } = useReleaseFilters();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { deleteRelease } = useDeleteRelease();
  const { showToast } = useToast();

  const isCreator = profile?.role === "creator";

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

  const handleDeleteSuccess = useCallback(() => {
    setSelectedRelease(null);
    refetch();
  }, [refetch]);

  const hasActiveFilters = selectedTypes.length > 1 || selectedTypes[0] !== 'all' || selectedGenres.length > 0;
  const showLoadMoreButton = hasActiveFilters && filteredReleases.length === 0 && totalCount > 0;

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
        genreFilterMode={genreFilterMode}
        onGenreFilterModeChange={handleGenreFilterModeChange}
      />

      <div className="mt-6">
        {loading && filteredReleases.length === 0 ? (
          <ReleaseList releases={[]} loading={true} />
        ) : filteredReleases.length === 0 ? (
          <div className="text-center">
            <p className="text-white/60 text-sm mb-4">
              {showLoadMoreButton
                ? "No releases found in the initial results."
                : "No releases match your criteria."}
            </p>
            {showLoadMoreButton && (
              <Button
                onClick={loadMore}
                disabled={loading}
                className="mx-auto"
              >
                Load More Releases
              </Button>
            )}
          </div>
        ) : (
          <ReleaseList
            releases={filteredReleases}
            loading={loading}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            showWeeklyGroups={true}
            onEditClick={setEditingRelease}
            onDeleteClick={setSelectedRelease}
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
          <ReleaseFormModal
            release={editingRelease}
            isOpen={!!editingRelease}
            onClose={() => setEditingRelease(null)}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </div>
  );
}
