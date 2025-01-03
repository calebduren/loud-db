import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useReleaseFilters } from '../../hooks/useReleaseFilters';
import { useLikedReleases } from '../../hooks/useLikedReleases';
import { useLikedReleasesByUser } from '../../hooks/useLikedReleasesByUser';
import { useProfile } from '../../hooks/useProfile';
import { ReleaseList } from '../releases/ReleaseList';
import { ReleaseFilters } from '../filters/ReleaseFilters';

export function LikedReleases() {
  const { username } = useParams();
  const { user } = useAuth();
  const { profile } = useProfile(username);
  
  // If viewing someone else's profile, use their ID
  const isOwnProfile = !username || user?.username === username;
  const { releases: ownReleases, loading: ownLoading } = useLikedReleases();
  const { releases: userReleases, loading: userLoading } = useLikedReleasesByUser(profile?.id);
  
  const releases = isOwnProfile ? ownReleases : userReleases;
  const loading = isOwnProfile ? ownLoading : userLoading;

  const {
    selectedType,
    selectedGenres,
    availableGenres,
    filteredReleases,
    handleTypeChange,
    handleGenreChange,
  } = useReleaseFilters(releases);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        {isOwnProfile ? "Your Liked Releases" : `${profile?.username}'s Liked Releases`}
      </h1>

      <ReleaseFilters
        selectedType={selectedType}
        selectedGenres={selectedGenres}
        availableGenres={availableGenres}
        onTypeChange={handleTypeChange}
        onGenreChange={handleGenreChange}
      />

      {filteredReleases.length === 0 ? (
        <p className="text-white/60">No releases found.</p>
      ) : (
        <ReleaseList releases={filteredReleases} />
      )}
    </div>
  );
}