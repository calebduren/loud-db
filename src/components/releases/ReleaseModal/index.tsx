import React from "react";
import { Release } from "../../../types/database";
import { Modal } from "../../ui/Modal";
import { Music, X } from "lucide-react";
import { LikeButton } from "../../LikeButton";
import { usePermissions } from "../../../hooks/usePermissions";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../ui/button";
import { TrackList } from "./TrackList";
import { ReleaseInfo } from "./ReleaseInfo";

interface ReleaseModalProps {
  release: Release;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: (release: Release) => void;
}

export function ReleaseModal({
  release,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ReleaseModalProps) {
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();

  // Check if user can edit this release - use memoized value to prevent unnecessary re-renders
  const canEdit = React.useMemo(() => {
    if (!user || !canManageReleases) return false;
    return isAdmin || user.id === release.created_by;
  }, [user?.id, canManageReleases, isAdmin, release.created_by]);

  // Only admins can delete releases - use memoized value
  const canDelete = React.useMemo(() => {
    if (!user?.id) return false;
    return isAdmin;
  }, [user?.id, isAdmin]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-[640px_1fr] h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 -right-10 z-100 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Left Column - Cover Art */}
        <div className="relative h-[640px]">
          {release.cover_url ? (
            <img
              src={release.cover_url}
              alt={`${release.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-gray-800)] flex items-center justify-center">
              <Music className="w-12 h-12 text-gray-700" />
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="relative flex flex-col h-full overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6">
              {/* Artist Section */}
              <div>
                <div className="text-sm tracking-wider text-white/60 mb-1">
                  Artist(s)
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="release-card__artist">
                    {release.artists?.map((ra) => ra.artist.name).join(", ")}
                  </h2>

                  {/* Admin Actions */}
                  {(canEdit || canDelete) && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {canEdit && onEdit && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(release);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div>
                <div className="text-sm uppercase tracking-wider text-white/60 mb-1">
                  Title
                </div>
                <h2 className="release-card__title">{release.name}</h2>
              </div>

              {/* Genres Section */}
              <div>
                <div className="text-sm uppercase tracking-wider text-white/60 mb-1">
                  Genres
                </div>
                <div className="flex flex-wrap gap-2">
                  {release.genres?.map((genre) => (
                    <div key={genre} className="release-card__type-pill">
                      {genre}
                    </div>
                  ))}
                </div>
              </div>

              <ReleaseInfo release={release} canEdit={canEdit} />
              <TrackList tracks={release.tracks || []} />
            </div>
          </div>

          {/* Fixed Actions Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm">
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
                    Spotify <span className="text-[#F1977E]">→</span>
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
                    Apple Music <span className="text-[#F1977E]">→</span>
                  </a>
                )}
              </div>
              <div
                className="release-card__like"
                onClick={(e) => e.stopPropagation()}
              >
                <LikeButton releaseId={release.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
