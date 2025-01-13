import React, { useState, useCallback } from "react";
import { ReleaseList } from "./ReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { ReleaseModal } from "./ReleaseModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";
import { PageTitle } from "../layout/PageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";

export function AllReleases() {
  const {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMoreRef,
    addReleaseOptimistically,
    updateReleaseOptimistically,
    backgroundRefetch,
    loadMore,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
  } = useReleaseFilters();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | undefined>(undefined);
  const [viewingRelease, setViewingRelease] = useState<Release | undefined>(undefined);
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isCreator = profile?.role === "creator";

  // Subscribe to release changes
  const { markAsUpdated } = useReleaseSubscription(backgroundRefetch);

  const handleCreateSuccess = useCallback(async (release: Release) => {
    console.log('AllReleases - handleCreateSuccess called');
    addReleaseOptimistically(release);
    setIsCreateModalOpen(false);
    backgroundRefetch();
  }, [addReleaseOptimistically, backgroundRefetch]);

  const handleEditSuccess = useCallback(async (release: Release) => {
    console.log('AllReleases - handleEditSuccess called');
    updateReleaseOptimistically(release);
    setEditingRelease(undefined);
    backgroundRefetch();
  }, [updateReleaseOptimistically, backgroundRefetch]);

  const handleDelete = useCallback(async (release: Release) => {
    console.log('AllReleases - handleDelete called');
    try {
      const { error } = await supabase
        .from('releases')
        .delete()
        .eq('id', release.id);

      if (error) throw error;
      setViewingRelease(undefined);
      backgroundRefetch();
    } catch (error) {
      console.error('Error deleting release:', error);
    }
  }, [backgroundRefetch]);

  const handleEdit = useCallback((release: Release) => {
    console.log('AllReleases - handleEdit called');
    setEditingRelease(release);
    setViewingRelease(undefined);
  }, []);

  const handleCloseCreate = useCallback((e?: React.MouseEvent) => {
    console.log('AllReleases - handleCloseCreate called');
    e?.preventDefault();
    e?.stopPropagation();
    setIsCreateModalOpen(false);
  }, []);

  const handleCloseEdit = useCallback((e?: React.MouseEvent) => {
    console.log('AllReleases - handleCloseEdit called');
    e?.preventDefault();
    e?.stopPropagation();
    setEditingRelease(undefined);
  }, []);

  const handleCloseView = useCallback((e?: React.MouseEvent) => {
    console.log('AllReleases - handleCloseView called');
    e?.preventDefault();
    e?.stopPropagation();
    setViewingRelease(undefined);
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
            loadMore={loadMore}
            showWeeklyGroups={true}
            onSelect={setViewingRelease}
            selectedRelease={viewingRelease}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        )}
      </div>

      {/* Modals */}
      {viewingRelease && (
        <ReleaseModal
          release={viewingRelease}
          isOpen={true}
          onClose={handleCloseView}
          onEdit={isAdmin ? () => handleEdit(viewingRelease) : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      )}

      {(isAdmin || isCreator) && (
        <>
          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onSuccess={handleCreateSuccess}
            onClose={handleCloseCreate}
          />

          {editingRelease && (
            <ReleaseFormModal
              isOpen={true}
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
