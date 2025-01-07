import React from 'react';
import { Release } from '../../../types/database';
import { Modal } from '../../ui/Modal';
import { Music, ExternalLinkArrow, Trash2, Pencil } from 'lucide-react';
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
          <div className="release-card__details">
            <div className="release-card__details-container">
              <div className="release-card__actions">
                <div className="release-card__links">
                  {release.spotify_url && (
                    <a
                      href={release.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="release-card__link"
                    >
                      Spotify <ExternalLinkArrow className="text-[#F1977E]" />
                    </a>
                  )}
                  {release.apple_music_url && (
                    <a
                      href={release.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="release-card__link"
                    >
                      Apple Music <ExternalLinkArrow className="text-[#F1977E]" />
                    </a>
                  )}
                </div>
                <div
                  className="release-card__like"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton releaseId={release.id} />
                </div>
                {(canEdit || canDelete) && (
                  <>
                    <div className="release-card__divider" />
                    <div className="flex items-stretch">
                      {canEdit && onEdit && (
                        <Button
                          variant="ghost"
                          className="h-full px-4 flex items-center gap-1 hover:bg-white/10 rounded-none"
                          onClick={onEdit}
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button
                          variant="ghost"
                          className="h-full px-4 flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-white/10 rounded-none"
                          onClick={onDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}