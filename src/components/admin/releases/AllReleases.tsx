import React, { useState, useCallback } from 'react';
import { WeeklyReleaseList } from '../../releases/WeeklyReleaseList';
import { useReleases } from '../../../hooks/useReleases';
import { ReleaseFormModal } from '../ReleaseFormModal';
import { Release } from '../../../types/database';
import { useReleaseSubscription } from '../../../hooks/useReleaseSubscription';
import { ReleaseFilters } from '../../filters/ReleaseFilters';
import { useReleaseFilters } from '../../../hooks/useReleaseFilters';
import { AdminToolbar } from './AdminToolbar';

export function AllReleases() {
  const { releases, loading, refetch } = useReleases();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

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
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <AdminToolbar onCreateClick={() => setIsCreateModalOpen(true)} />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">All Releases</h2>

        <ReleaseFilters
          loading={loading}
          selectedType={selectedType}
          selectedGenres={selectedGenres}
          availableGenres={availableGenres}
          onTypeChange={handleTypeChange}
          onGenreChange={handleGenreChange}
        />

        {loading ? (
          <div>Loading...</div>
        ) : (
          <WeeklyReleaseList 
            releases={filteredReleases} 
            showActions 
            onEdit={setEditingRelease}
            onDelete={refetch}
          />
        )}
      </div>

      <ReleaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

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