import React, { useState } from "react";
import { Release } from "../../types/database";
import { Music, ExternalLink } from "lucide-react";
import { LikeButton } from "../LikeButton";
import { ReleaseModal } from "./ReleaseModal";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";

interface ReleaseListProps {
  releases: Release[];
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (release: Release) => void;
  onDelete?: () => void;
}

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

  if (!releases) return null;

  const formatArtists = (release: Release) => {
    const sortedArtists = [...release.artists].sort((a, b) => a.position - b.position);
    return sortedArtists.map((ra) => ra.artist.name).join(", ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="release-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="release-card">
            <div className="release-card__cover">
              <div className="release-card__placeholder animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sort releases by date (newest first)
  const sortedReleases = [...releases].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="release-grid">
      {sortedReleases.map((release) => (
        <div
          key={release.id}
          className="release-card"
          onClick={() => setSelectedRelease(release)}
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
              <div>
                <div className="release-card__type">
                  <div className="release-card__type-pill">
                    {release.type || "Album"}
                  </div>
                </div>

                <div className="release-card__title">
                  <p>{formatArtists(release)}</p>
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
                  <span className="release-card__info-label">Tracks</span>
                  <span className="release-card__info-value">{release.track_count}</span>
                </div>
                <div className="release-card__info-row">
                  <span className="release-card__info-label">Released</span>
                  <span className="release-card__info-value">{formatDate(release.release_date)}</span>
                </div>
                <div className="release-card__info-row">
                  <span className="release-card__info-label">Label</span>
                  <span className="release-card__info-value">{release.record_label || "—"}</span>
                </div>
              </div>

              <div className="release-card__divider" />

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
                      Spotify <ExternalLink className="w-3 h-3" />
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
                      Apple Music <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div onClick={(e) => e.stopPropagation()}>
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
          onEdit={onEdit && (() => {
            onEdit(selectedRelease);
            setSelectedRelease(null);
          })}
          onDelete={onDelete && (() => {
            onDelete();
            setSelectedRelease(null);
          })}
        />
      )}
    </div>
  );
}
