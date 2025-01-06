import React, { useState, useCallback } from "react";
import { useReleases } from "../../hooks/useReleases";
import { ReleaseList } from "./ReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";
import { PageHeader } from "../layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

interface AdminToolbarProps {
  onCreateClick: () => void;
}

const AdminToolbar = ({ onCreateClick }: AdminToolbarProps) => (
  <Button onClick={onCreateClick} className="flex items-center gap-2">
    <Plus className="w-4 h-4" />
    Add release
  </Button>
);

export function AllReleases() {
  const { releases, loading, hasMore, loadMoreRef, refetch } = useReleases();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isCreator = profile?.role === "creator";

  const {
    selectedType,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange,
  } = useReleaseFilters(releases);

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

  return (
    <div>
      <PageHeader
        title="New music"
        subtitle="Releases are sorted based on your preferences and likes"
        showAddRelease={isAdmin || isCreator}
        showImportPlaylist={isAdmin}
      />

      <ReleaseFilters
        loading={loading}
        selectedType={selectedType}
        selectedGenres={selectedGenres}
        availableGenres={availableGenres}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
      />

      <div className="px-6">
        {loading && filteredReleases.length === 0 ? (
          <ReleaseList releases={[]} loading={true} />
        ) : filteredReleases.length === 0 ? (
          <p className="text-white/60">No releases found.</p>
        ) : (
          <ReleaseList
            releases={filteredReleases || []}
            loading={loading}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            showActions={canManageReleases}
            showWeeklyGroups={true}
            onEdit={canManageReleases ? setEditingRelease : undefined}
          />
        )}
      </div>

      {/* Admin Modals */}
      {(isAdmin || isCreator) && (
        <>
          <AdminToolbar onCreateClick={() => setIsCreateModalOpen(true)} />
          <ReleaseFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />

          {editingRelease && (
            <ReleaseFormModal
              isOpen={true}
              release={editingRelease}
              onClose={() => setEditingRelease(null)}
              onSuccess={handleEditSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}
