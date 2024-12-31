import React from 'react';
import { Release } from '../../../types/database';
import { Modal } from '../../ui/Modal';
import { Music, ExternalLink, Trash2, Pencil } from 'lucide-react';
import { LikeButton } from '../../common/LikeButton';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../ui/button';
import { TrackList } from './TrackList';
import { ReleaseInfo } from './ReleaseInfo';

interface ReleaseModalProps {
  release: Release;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReleaseModal({ 
  release, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ReleaseModalProps) {
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();

  // Check if user can edit this release
  const canEdit = React.useMemo(() => {
    if (!user || !canManageReleases) return false;
    return isAdmin || user.id === release.created_by;
  }, [user, canManageReleases, isAdmin, release.created_by]);

  // Only admins can delete releases
  const canDelete = React.useMemo(() => {
    if (!user) return false;
    return isAdmin;
  }, [user, isAdmin]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={release.name}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Cover Art */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-black">
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
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <ReleaseInfo release={release} canEdit={canEdit} />
          
          <TrackList tracks={release.tracks || []} />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-4">
              {release.spotify_url && (
                <a
                  href={release.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  className="text-[#FA57C1] hover:text-[#ff57c1] transition-colors flex items-center gap-1"
                >
                  Apple Music <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-4">
              <LikeButton releaseId={release.id} />
              {canEdit && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}