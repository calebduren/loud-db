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
import { Button } from "../ui/button";

export function AllReleases() {
  const {
    selectedTypes,
    selectedGenres,
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
  const [editingRelease, setEditingRelease] = useState<Release | undefined>(undefined);
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isCreator = profile?.role === "creator";

  // Subscribe to release changes
  const { markAsUpdated } = useReleaseSubscription(refetch);

  const handleCreateSuccess = useCallback(() => {
    // Mark as updated before closing modal
    markAsUpdated();
    // Close modal
    setIsCreateModalOpen(false);
    // Refetch after a longer delay to ensure the toast shows
    setTimeout(refetch, 500);
  }, [refetch, markAsUpdated]);

  const handleEditSuccess = useCallback(() => {
    // Mark as updated before closing modal
    markAsUpdated();
    // Close modal
    setEditingRelease(undefined);
    // Refetch after a longer delay to ensure the toast shows
    setTimeout(refetch, 500);
  }, [refetch, markAsUpdated]);

  const handleCloseCreate = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsCreateModalOpen(false);
  }, []);

  const handleCloseEdit = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setEditingRelease(undefined);
  }, []);

  // Only show loading state on initial load when no releases are available
  if (loading && !filteredReleases.length) {
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
          genreFilterMode={genreFilterMode}
          onTypeChange={handleTypeChange}
          onGenreChange={handleGenreChange}
          onGenreFilterModeChange={handleGenreFilterModeChange}
        />
        <ReleaseList releases={[]} loading={true} showWeeklyGroups={true} />
      </div>
    );
  }

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
        genreFilterMode={genreFilterMode}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
        onGenreFilterModeChange={handleGenreFilterModeChange}
      />

      <div className="mt-6">
        {filteredReleases.length === 0 ? (
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
            onEdit={isAdmin ? setEditingRelease : undefined}
          />
        )}
      </div>

      {(isAdmin || isCreator) && (
        <>
          {isCreateModalOpen && (
            <ReleaseFormModal
              onSuccess={handleCreateSuccess}
              onClose={handleCloseCreate}
            />
          )}

          {editingRelease && (
            <ReleaseFormModal
              release={editingRelease}
              onSuccess={handleEditSuccess}
              onClose={handleCloseEdit}
            />
          )}
        </>
      )}
    </div>
  );
}
