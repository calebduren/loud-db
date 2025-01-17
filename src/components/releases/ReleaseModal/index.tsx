import React from "react";
import { Release } from "../../../types/database";
import { Modal } from "../../ui/Modal";
import { ImageOff, X } from "lucide-react";
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
      <div className="release-modal__grid">
        {/* Left Column - Cover Art */}
        <div className="release-modal__left">
          {release.cover_url ? (
            <img
              src={release.cover_url}
              alt={`${release.name} cover`}
              className="release-modal__cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-gray-800)] flex items-center justify-center">
              <ImageOff size={14} strokeWidth={1.5} className="text-gray-600" />
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="release-modal__right">
          {/* Close Button */}
          <button onClick={onClose} className="release-modal__close">
            <X size={16} strokeWidth={1.5} />
          </button>
          {/* Scrollable Content */}
          <div className="release-modal__scrollable">
            {/* Artist Section */}
            <div>
              <div className="release-card__label">Artist(s)</div>
              <h2 className="release-card__artist">
                {release.artists?.map((ra) => ra.artist.name).join(", ")}
              </h2>
            </div>

            {/* Title Section */}
            <div>
              <div className="release-card__label">Title</div>
              <h2 className="release-card__title">{release.name}</h2>
            </div>
            <ReleaseInfo release={release} />
            <TrackList tracks={release.tracks || []} />
            {/* Admin Actions */}
            {(canEdit || canDelete) && (
              <div>
                <div className="release-card__label">Actions</div>
                <div
                  className="flex gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canEdit && onEdit && (
                    <Button
                      variant="secondary"
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
              </div>
            )}
          </div>

          {/* Fixed Actions Bar */}
          <div className="release-modal__bottom-actions">
            <div className="release-card__links">
              <div>
                {release.spotify_url && (
                  <Button
                    variant="primary"
                    className="release-card__link"
                    onClick={(e) => e.stopPropagation()}
                    href={release.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Spotify <ExternalLinkArrow />
                  </Button>
                )}
                {release.apple_music_url && (
                  <Button
                    variant="primary"
                    className="release-card__link"
                    onClick={(e) => e.stopPropagation()}
                    href={release.apple_music_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apple Music <ExternalLinkArrow />
                  </Button>
                )}
              </div>
              <div
                className="release__like"
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
