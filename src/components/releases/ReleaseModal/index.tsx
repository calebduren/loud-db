import React from "react";
import { Release } from "../../../types/database";
import { Modal } from "../../ui/Modal";
import { Music, X } from "lucide-react";
import { LikeButton } from "../../LikeButton";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../ui/button";
import { TrackList } from "./TrackList";
import { ReleaseInfo } from "./ReleaseInfo";
import { ExternalLinkArrow } from "../../icons/ExternalLinkArrow";

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
  const { user, isAdmin, canManageReleases } = useAuth();

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
    <Modal className="release-modal" isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-[640px_1fr] h-full">
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
        <div className="relative flex flex-col h-full overflow-hidden pb-16">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-100 text-white/60 hover:text-white transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
          {/* Scrollable Content */}
          <div className="release-modal__scrollable">
            <div className="space-y-6">
              {/* Artist Section */}
              <div>
                <div className="release-card__label">Artist(s)</div>
                <div className="flex items-center justify-between">
                  <h2 className="release-card__artist">
                    {release.artists?.map((ra) => ra.artist.name).join(", ")}
                  </h2>
                </div>
              </div>

              {/* Title Section */}
              <div>
                <div className="release-card__label">Title</div>
                <h2 className="release-card__title">{release.name}</h2>
              </div>
              <ReleaseInfo release={release} canEdit={canEdit} />
              <TrackList tracks={release.tracks || []} />
            </div>
          </div>

          {/* Fixed Actions Bar */}
          <div className="release-modal__bottom-actions">
            <div className="release-card__actions">
              <div className="release-card__links">
                <div>
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
                      Apple Music{" "}
                      <ExternalLinkArrow className="text-[#F1977E]" />
                    </a>
                  )}
                </div>

                {/* Admin Actions */}
                <div>
                  {(canEdit || canDelete) && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
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
