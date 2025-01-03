import React, { useState } from 'react';
import { Release } from '../../types/database';
import { Music, ExternalLink } from 'lucide-react';
import { LikeButton } from '../common/LikeButton';
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
          className="relative group cursor-pointer overflow-hidden bg-[#262626] border border-white/[0.02] rounded-[12px] shadow-[0px_12px_20px_0px_rgba(0,0,0,0.40),1px_1px_1px_0px_rgba(255,255,255,0.10)_inset]"
          onClick={() => setSelectedRelease(release)}
          data-release-id={release.id}
        >
          {/* Cover Image Container */}
          <div className="relative aspect-square">
            {/* Image */}
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

            {/* Release Type Pill */}
            <div className="absolute top-4 left-4">
              <div className="pill pill--release-type">{release.type || 'Album'}</div>
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(180deg,rgba(38,38,38,0.00)_0%,rgba(38,38,38,0.80)_80%,#262626_100%)] p-6">
              {/* Genre Pills */}
              {release.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {release.genres.map(genre => (
                    <div key={genre} className="pill pill--genre">
                      {genre}
                    </div>
                  ))}
                </div>
              )}

              {/* Title and Artist */}
              <div>
                <p className="text-[24px] text-white mb-1">
                  {release.artists
                    .sort((a, b) => a.position - b.position)
                    .map(ra => ra.artist.name)
                    .join(', ')}
                </p>
                <h3 className="text-[24px] font-medium text-white italic">{release.name}</h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Release Info Grid */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <p className="text-[12px] font-mono text-white/40 mb-1">Tracks</p>
                  <p className="text-[12px] font-medium text-white">{release.track_count}</p>
                </div>
                <div>
                  <p className="text-[12px] font-mono text-white/40 mb-1">Released</p>
                  <p className="text-[12px] font-medium text-white">
                    {new Date(new Date(release.release_date).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <p className="text-[12px] font-mono text-white/40 mb-1">Type</p>
                  <p className="text-[12px] font-medium text-white">{release.type || 'Album'}</p>
                </div>
                <div>
                  <p className="text-[12px] font-mono text-white/40 mb-1">Label</p>
                  <p className="text-[12px] font-medium text-white">{release.record_label || '—'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/[0.08]">
              <div className="flex items-center">
                <div className="flex gap-6 flex-1">
                  {release.spotify_url && (
                    <a
                      href={release.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[#FF5353] hover:text-[#ff6e6e] transition-colors flex items-center gap-1.5 text-lg font-medium"
                    >
                      Spotify <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {release.apple_music_url && (
                    <a
                      href={release.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-[#FF5353] hover:text-[#ff6e6e] transition-colors flex items-center gap-1.5 text-lg font-medium"
                    >
                      Apple Music <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="pl-6 border-l border-white/[0.08] flex items-center gap-2">
                  <div onClick={e => e.stopPropagation()}>
                    <LikeButton releaseId={release.id} />
                  </div>
                  <span className="text-2xl font-medium text-white">0</span>
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