import React, { useState, useCallback, useEffect } from "react";
import { ReleaseList } from "./ReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { ReleaseModal } from "./ReleaseModal";
import { PageTitle } from "../layout/PageTitle";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";
import { ArrowUpToLine } from "lucide-react";
import cn from "classnames";
import { logger } from "../../lib/logger";

export function AllReleases() {
  const {
    selectedTypes,
    selectedGenres,
    genreFilterMode,
    releases: filteredReleases,
    loading,
    hasMore,
    totalCount,
    loadMore,
    handleTypeChange,
    handleGenreChange,
    handleGenreFilterModeChange,
    backgroundRefetch,
    addReleaseOptimistically,
    updateReleaseOptimistically,
  } = useReleaseFilters();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | undefined>(undefined);
  const [viewingRelease, setViewingRelease] = useState<Release | undefined>(undefined);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { isAdmin, user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isCreator = profile?.role === "creator";

  // Subscribe to release changes
  useReleaseSubscription(backgroundRefetch);

  const handleCreateSuccess = useCallback(
    (release: Release) => {
      addReleaseOptimistically(release);
      setIsCreateModalOpen(false);
    },
    [addReleaseOptimistically]
  );

  const handleEditSuccess = useCallback(
    async (release: Release) => {
      logger.debug("AllReleases - handleEditSuccess called");
      updateReleaseOptimistically(release);
      setEditingRelease(undefined);
      backgroundRefetch();
    },
    [updateReleaseOptimistically, backgroundRefetch]
  );

  const handleDelete = useCallback(
    async (release: Release) => {
      logger.debug("AllReleases - handleDelete called");
      try {
        const { error } = await supabase
          .from("releases")
          .delete()
          .eq("id", release.id);

        if (error) throw error;
        setViewingRelease(undefined);
        backgroundRefetch();
      } catch (error) {
        console.error("Error deleting release:", error);
      }
    },
    [backgroundRefetch]
  );

  const handleEdit = useCallback((release: Release) => {
    logger.debug("AllReleases - handleEdit called");
    setEditingRelease(release);
    setViewingRelease(undefined);
  }, []);

  const handleCloseCreate = useCallback((e?: React.MouseEvent) => {
    logger.debug("AllReleases - handleCloseCreate called");
    e?.preventDefault();
    e?.stopPropagation();
    setIsCreateModalOpen(false);
  }, []);

  const handleCloseEdit = useCallback((e?: React.MouseEvent) => {
    logger.debug("AllReleases - handleCloseEdit called");
    e?.preventDefault();
    e?.stopPropagation();
    setEditingRelease(undefined);
  }, []);

  const handleCloseView = useCallback((e?: React.MouseEvent) => {
    logger.debug("AllReleases - handleCloseView called");
    e?.preventDefault();
    e?.stopPropagation();
    setViewingRelease(undefined);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollButton(scrollPosition > 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only show loading state on initial load when no releases are available
  if (loading && !filteredReleases?.length) {
    return (
      <div>
        <PageTitle
          title="New music"
          subtitle="Releases are sorted based on your preferences and likes"
          showAddRelease={isAdmin || isCreator}
          showImportPlaylist={isAdmin}
          onAddRelease={() => setIsCreateModalOpen(true)}
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
        <div className="releases">
          <ReleaseList.Skeleton />
        </div>
      </div>
    );
  }

  const hasActiveFilters =
    selectedTypes.length > 1 ||
    selectedTypes[0] !== "all" ||
    selectedGenres.length > 0;
  const showLoadMoreButton =
    hasActiveFilters && filteredReleases.length === 0 && totalCount > 0;

  return (
    <div>
      <PageTitle
        title="New music"
        subtitle="Releases are sorted based on your preferences and likes"
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
        onAddRelease={() => setIsCreateModalOpen(true)}
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
        <div className="releases">
          {loading ? (
            <ReleaseList.Skeleton />
          ) : filteredReleases?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4">
              <p className="text-gray-500">No releases match your criteria</p>
            </div>
          ) : (
            <ReleaseList
              releases={filteredReleases || []}
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
              onSelect={setViewingRelease}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          )}
        </div>
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
            onClose={handleCloseCreate}
            onSuccess={handleCreateSuccess}
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

      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        className={cn(
          "scroll-to-top rounded-full btn--glass",
          showScrollButton ? "scroll-to-top--visible" : "scroll-to-top--hidden"
        )}
        size="icon"
        tooltip="Scroll to top"
      >
        <ArrowUpToLine size={20} strokeWidth={1.5} />
      </Button>
    </div>
  );
}
