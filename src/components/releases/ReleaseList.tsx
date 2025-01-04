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
          className="relative group cursor-pointer overflow-hidden bg-[#262626] border border-white/[0.02] rounded-[12px] shadow-[0px_12px_20px_0px_rgba(0,0,0,0.40)] min-w-[288px] max-w-[354px] flex flex-col"
          onClick={() => setSelectedRelease(release)}
          data-release-id={release.id}
        >
          {/* Cover Image Container */}
          <div className="relative p-5 flex flex-col justify-end min-h-[354px] font-[var(--font-innovator)] text-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 w-[354px] h-[354px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {release.cover_url ? (
                <img 
                  src={release.cover_url} 
                  alt={`${release.name} cover`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <Music className="w-12 h-12 text-gray-700" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between flex-1">
              {/* Release Type Pill */}
              <div className="flex items-center gap-2 text-[12px] font-medium">
                <div className="bg-[rgba(32,32,32,0.6)] border border-black/5 rounded-[6px] px-2 py-1">
                  {release.type || 'Album'}
                </div>
              </div>

              <div className="mt-[194px] flex flex-col">
                {/* Title and Artist */}
                <div className="text-[24px] font-semibold leading-[1.1]">
                  <p>
                    {release.artists
                      .sort((a, b) => a.position - b.position)
                      .map(ra => ra.artist.name)
                      .join(', ')}
                  </p>
                  <h3 className="mt-2">{release.name}</h3>
                </div>

                {/* Genre Pills */}
                {release.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {release.genres.slice(0, 3).map(genre => (
                      <div 
                        key={genre} 
                        className="bg-white/30 border border-white/10 rounded-[6px] px-2 py-1 text-[12px] font-medium"
                      >
                        {genre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-[#262626] w-full px-[6px] pb-[6px]">
            <div className="bg-[#363636] rounded-[3px_3px_8px_8px] w-full">
              {/* Release Info */}
              <div className="p-[14px] text-[12px] leading-[1.25]">
                <div className="flex items-start gap-2 min-w-[143px] whitespace-nowrap">
                  <span className="text-[#B3B3B3] font-[var(--font-geist-mono)] w-16">Tracks</span>
                  <span className="text-white font-[var(--font-innovator)] font-medium">{release.track_count}</span>
                </div>
                <div className="flex items-start gap-2 min-w-[143px] mt-3">
                  <span className="text-[#B3B3B3] font-[var(--font-geist-mono)] w-16">Released</span>
                  <span className="text-white font-[var(--font-innovator)] font-medium">
                    {new Date(release.release_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-2 min-w-[143px] mt-3">
                  <span className="text-[#B3B3B3] font-[var(--font-geist-mono)] w-16">Label</span>
                  <span className="text-white font-[var(--font-innovator)] font-medium">
                    {release.record_label || '—'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-white/[0.06]" />

              {/* Actions */}
              <div className="flex items-center font-[var(--font-innovator)] font-semibold">
                {/* Links */}
                <div className="flex-1 flex-shrink-0 basis-0 flex items-center gap-6 text-[#F1977E] px-[14px] py-[14px]">
                  {release.spotify_url && (
                    <a
                      href={release.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-end gap-0.5 whitespace-nowrap hover:opacity-80 transition-opacity"
                    >
                      Spotify <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {release.apple_music_url && (
                    <a
                      href={release.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-end gap-0.5 whitespace-nowrap hover:opacity-80 transition-opacity"
                    >
                      Apple Music <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-[42px] bg-white/[0.06]" />

                {/* Like Button */}
                <div className="px-[14px] py-[14px] text-white whitespace-nowrap">
                  <LikeButton release={release} />
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