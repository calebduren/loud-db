import React, { useState, useCallback } from "react";
import { useReleases } from "../../hooks/useReleases";
import { WeeklyReleaseList } from "./WeeklyReleaseList";
import { ReleaseFilters } from "../filters/ReleaseFilters";
import { useReleaseFilters } from "../../hooks/useReleaseFilters";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { Release } from "../../types/database";
import { useReleaseSubscription } from "../../hooks/useReleaseSubscription";
import { usePermissions } from "../../hooks/usePermissions";

export function AllReleases() {
  const { releases, loading, refetch } = useReleases();
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const { canManageReleases } = usePermissions();

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

  const handleEditSuccess = useCallback(() => {
    setEditingRelease(null);
    refetch();
  }, [refetch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Latest Releases</h1>
      </div>

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
          onEdit={setEditingRelease}
          onDelete={refetch}
        />
      )}

      {/* Edit Modal */}
      {editingRelease && (
        <ReleaseFormModal
          isOpen={true}
          onClose={() => setEditingRelease(null)}
          release={editingRelease}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
