import React, { useState } from "react";
import { Release } from "../../types/database";
import { Music, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { LikeButton } from "../LikeButton";
import { ReleaseModal } from "./ReleaseModal";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";

interface WeekGroup {
  weekRange: {
    start: Date;
    end: Date;
    key: string;
    label: string;
  };
  releases: Release[];
}

interface ReleaseListProps {
  releases: Release[];
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (release: Release) => void;
  onDelete?: () => void;
  hasMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  showWeeklyGroups?: boolean;
}

export function ReleaseList({
  releases,
  loading,
  onEdit,
  onDelete,
  hasMore,
  loadMoreRef,
  showWeeklyGroups = false,
}: ReleaseListProps) {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const { isAdmin, canManageReleases } = usePermissions();
  const { user } = useAuth();

  if (!releases) return null;

  const formatArtists = (release: Release) => {
    if (!release.artists?.length) return "";
    const sortedArtists = [...release.artists].sort(
      (a, b) => a.position - b.position
    );
    return sortedArtists.map((ra) => ra.artist.name).join(", ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const getWeekKey = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  };

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // End of week (Saturday)
    return {
      start,
      end,
      key: start.toISOString(),
      label: `${formatDate(start.toISOString())} - ${formatDate(
        end.toISOString()
      )}`,
    };
  };

  const groupReleasesByWeek = (releases: Release[]): WeekGroup[] => {
    const groups = new Map<string, Release[]>();
    const sortedReleases = [...releases].sort((a, b) => {
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      return dateB - dateA;
    });

    sortedReleases.forEach((release) => {
      const weekKey = getWeekKey(new Date(release.release_date));
      if (!groups.has(weekKey)) {
        groups.set(weekKey, []);
      }
      groups.get(weekKey)!.push(release);
    });

    return Array.from(groups.entries())
      .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
      .map(([key, releases]) => ({
        weekRange: getWeekRange(new Date(key)),
        releases,
      }));
  };

  const toggleGroup = (weekKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  if (loading && releases.length === 0) {
    return (
      <div className="space-y-8">
        <div className="release-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="release-card">
              <div className="release-card__cover">
                <div className="release-card__placeholder animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderRelease = (release: Release) => (
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
                  <div key={genre} className="release-card__genres-pill">
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
              <span className="release-card__info-value">
                {release.track_count}
              </span>
            </div>
            <div className="release-card__info-row">
              <span className="release-card__info-label">Released</span>
              <span className="release-card__info-value">
                {formatDate(release.release_date)}
              </span>
            </div>
            <div className="release-card__info-row">
              <span className="release-card__info-label">Label</span>
              <span className="release-card__info-value">
                {release.record_label || "—"}
              </span>
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
  );

  return (
    <div className="space-y-8">
      {showWeeklyGroups ? (
        groupReleasesByWeek(releases).map(({ weekRange, releases }) => (
          <div key={weekRange.key} className="relative">
            <div className="sticky top-0 -mx-6 px-6 py-2 z-50">
              <button
                onClick={() => toggleGroup(weekRange.key)}
                className="flex items-center gap-2 text-xl font-semibold hover:text-white/80 transition-colors"
              >
                {weekRange.label}
                <span className="text-sm font-normal text-white/60">
                  ({releases.length}{" "}
                  {releases.length === 1 ? "release" : "releases"})
                </span>
                {collapsedGroups.has(weekRange.key) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            </div>
            {!collapsedGroups.has(weekRange.key) && (
              <div className="release-grid mt-4">
                {releases.map(renderRelease)}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="release-grid">{releases.map(renderRelease)}</div>
      )}

      {/* Load more trigger */}
      {!loading && loadMoreRef && (
        <div
          ref={loadMoreRef}
          className="col-span-full h-10 flex items-center justify-center"
        >
          {hasMore && (
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          )}
        </div>
      )}

      {selectedRelease && (
        <ReleaseModal
          release={selectedRelease}
          isOpen={true}
          onClose={() => setSelectedRelease(null)}
          onEdit={
            onEdit &&
            (() => {
              onEdit(selectedRelease);
              setSelectedRelease(null);
            })
          }
          onDelete={
            onDelete &&
            (() => {
              onDelete();
              setSelectedRelease(null);
            })
          }
        />
      )}
    </div>
  );
}
