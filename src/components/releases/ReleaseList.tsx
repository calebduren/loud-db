import React, { useState } from "react";
import { Release } from "../../types/database";
import { Music } from "lucide-react";
import { LikeButton } from "../common/LikeButton";
import { ReleaseModal } from "./ReleaseModal";
import { ReleaseSkeleton } from "./ReleaseSkeleton";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";

interface ReleaseListProps {
  releases: Release[];
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (release: Release) => void;
  onDelete?: () => void;
}

const ExternalLinkIcon = () => (
  <svg
    width="14"
    height="15"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.08301 4.5835H9.91634V9.41683"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M4.08301 10.4168L8.91634 5.5835"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </svg>
);

export function ReleaseList({
  releases,
  loading,
  showActions,
  onEdit,
  onDelete,
}: ReleaseListProps) {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();

  const canEditRelease = (release: Release) => {
    if (!user) return false;
    if (isAdmin) return true;
    return release.created_by === user.id;
  };

  const canDeleteRelease = (release: Release) => {
    if (!user) return false;
    if (isAdmin) return true;
    return release.created_by === user.id;
  };

  if (loading) {
    return (
      <div className="release-grid">
        {[...Array(6)].map((_, i) => (
          <ReleaseSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="release-grid">
      {releases.map((release) => (
        <div
          key={release.id}
          className="release-card group"
          onClick={() => setSelectedRelease(release)}
          data-release-id={release.id}
        >
          <div className="release-card__cover">
            <div className="release-card__image-container">
              {release.cover_url ? (
                <img
                  src={release.cover_url}
                  alt={`${release.name} cover`}
                  className="release-card__image"
                />
              ) : (
                <div className="release-card__placeholder">
                  <Music className="w-12 h-12 text-gray-700" />
                </div>
              )}
              <div className="release-card__gradient" />
            </div>

            <div className="release-card__content">
              <div className="release-card__type">
                <div className="release-card__type-pill">
                  {release.type || "Album"}
                </div>
              </div>

              <div>
                <div className="release-card__title">
                  <p>
                    {release.artists
                      .sort((a, b) => a.position - b.position)
                      .map((ra) => ra.artist.name)
                      .join(", ")}
                  </p>
                  <h3>{release.name}</h3>
                </div>

                {release.genres?.length > 0 && (
                  <div className="release-card__genres">
                    {release.genres.slice(0, 3).map((genre) => (
                      <div
                        key={genre}
                        className="release-card__genres-pill"
                      >
                        {genre}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="release-card__details">
            <div className="release-card__details-container">
              <div className="release-card__info">
                <div className="release-card__info-row">
                  <span className="release-card__info-label">
                    Tracks
                  </span>
                  <span className="release-card__info-value">
                    {release.track_count}
                  </span>
                </div>
                <div className="release-card__info-row">
                  <span className="release-card__info-label">
                    Released
                  </span>
                  <span className="release-card__info-value">
                    {new Date(release.release_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="release-card__info-row">
                  <span className="release-card__info-label">
                    Label
                  </span>
                  <span className="release-card__info-value">
                    {release.record_label || "—"}
                  </span>
                </div>
              </div>

              <div className="release-divider" />

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
                      Spotify <ExternalLinkIcon />
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
                      Apple Music <ExternalLinkIcon />
                    </a>
                  )}
                </div>

                <div className="release-card__divider" />

                <div className="release-card__like">
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
          onEdit={
            showActions && onEdit && canEditRelease(selectedRelease)
              ? () => {
                  onEdit(selectedRelease);
                  setSelectedRelease(null);
                }
              : undefined
          }
          onDelete={
            showActions && onDelete && canDeleteRelease(selectedRelease)
              ? () => {
                  onDelete();
                  setSelectedRelease(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
