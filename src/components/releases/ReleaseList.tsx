import React, { useState } from 'react';
import { Release } from '../../types/database';
import { Music, ExternalLink } from 'lucide-react';
import { LikeButton } from '../common/LikeButton';
import { GenreDisplay } from './GenreDisplay';
import { ReleaseModal } from './ReleaseModal';
import { ReleaseSkeleton } from './ReleaseSkeleton';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';

interface ReleaseListProps {
  releases: Release[];
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (release: Release) => void;
  onDelete?: () => void;
}

export function ReleaseList({ releases, loading, showActions, onEdit, onDelete }: ReleaseListProps) {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();

  // Check if user can edit a specific release
  const canEditRelease = (release: Release) => {
    if (!user || !canManageReleases) return false;
    return isAdmin || user.id === release.created_by;
  };

  // Check if user can delete a specific release
  const canDeleteRelease = (release: Release) => {
    if (!user) return false;
    return isAdmin; // Only admins can delete releases
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <ReleaseSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {releases.map((release) => (
        <div 
          key={release.id} 
          className="relative group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
          onClick={() => setSelectedRelease(release)}
          data-release-id={release.id}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-black">
            {/* Cover Image */}
            <div className="absolute inset-0">
              {release.cover_url ? (
                <img 
                  src={release.cover_url} 
                  alt={`${release.name} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <Music className="w-12 h-12 text-gray-700" />
                </div>
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{release.name}</h3>
                <p className="text-white/80">
                  {release.artists
                    .sort((a, b) => a.position - b.position)
                    .map(ra => ra.artist.name)
                    .join(', ')}
                </p>
                {release.genres?.length > 0 && (
                  <div className="pt-2">
                    <GenreDisplay genres={release.genres} />
                  </div>
                )}
              </div>

              {/* Release Info Grid */}
              <div className="grid grid-cols-3 gap-4 text-sm my-4">
                <div>
                  <p className="text-white/60">Released</p>
                  <p className="text-white">
                    {new Date(release.release_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Tracks</p>
                  <p className="text-white">{release.track_count}</p>
                </div>
                <div>
                  <p className="text-white/60">Label</p>
                  <p className="text-white">{release.record_label || '—'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex gap-4">
                  {release.spotify_url && (
                    <a
                      href={release.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[#1DB954] hover:text-[#1ed760] transition-colors flex items-center gap-1"
                    >
                      Spotify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {release.apple_music_url && (
                    <a
                      href={release.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[#FA57C1] hover:text-[#ff57c1] transition-colors flex items-center gap-1"
                    >
                      Apple Music <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div onClick={e => e.stopPropagation()}>
                  <LikeButton releaseId={release.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedRelease && (
        <ReleaseModal
          release={selectedRelease}
          isOpen={true}
          onClose={() => setSelectedRelease(null)}
          onEdit={showActions && onEdit && canEditRelease(selectedRelease) ? 
            () => {
              onEdit(selectedRelease);
              setSelectedRelease(null);
            } : undefined}
          onDelete={showActions && onDelete && canDeleteRelease(selectedRelease) ?
            () => {
              onDelete();
              setSelectedRelease(null);
            } : undefined}
        />
      )}
    </div>
  );
}