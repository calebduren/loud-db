import React, { useState, useCallback } from "react";
import { useReleases } from "../../hooks/useReleases";
import { WeeklyReleaseList } from "./WeeklyReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";

interface AdminToolbarProps {
  onCreateClick: () => void;
}

function AdminToolbar({ onCreateClick }: AdminToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <Button onClick={onCreateClick} variant="primary">
        <Plus className="w-4 h-4 mr-2" />
        New Release
      </Button>
    </div>
  );
}

export function AllReleases() {
  const { releases, loading, refetch } = useReleases();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isAdmin ? "Admin Dashboard" : "Latest Releases"}
        </h1>
        {canManageReleases && (
          <AdminToolbar onCreateClick={() => setIsCreateModalOpen(true)} />
        )}
      </div>

      {isAdmin && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">All Releases</h2>
        </div>
      )}

      <ReleaseFilters
        loading={loading}
        selectedType={selectedType}
        selectedGenres={selectedGenres}
        availableGenres={availableGenres}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
      />

      {loading ? (
        <WeeklyReleaseList releases={[]} loading={true} />
      ) : filteredReleases.length === 0 ? (
        <p className="text-white/60">No releases found.</p>
      ) : (
        <WeeklyReleaseList
          releases={filteredReleases}
          showActions={canManageReleases}
          onEdit={canManageReleases ? setEditingRelease : undefined}
        />
      )}

      {/* Admin Modals */}
      {canManageReleases && (
        <>
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
