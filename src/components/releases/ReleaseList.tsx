import React, { useState, useCallback, useMemo } from "react";
import { Release } from "../../types/database";
import { Music } from "lucide-react";
import { LikeButton } from "../LikeButton";
import { ExternalLinkArrow } from "../icons/ExternalLinkArrow";
import { Button } from "../ui/button";
import { useReleaseSorting } from "../../hooks/useReleaseSorting"; // Import the useReleaseSorting hook

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
  hasMore?: boolean;
  loadMore?: () => void;
  showWeeklyGroups?: boolean;
  onSelect?: (release: Release) => void;
  onEdit?: (release: Release) => void;
  onDelete?: (release: Release) => void;
}

const SkeletonCard = () => (
  <div className="release-card">
    <div className="release-card__cover">
      <div className="release-card__image-container bg-white/5">
        <div className="release-card__gradient" />
      </div>

      <div className="release-card__content">
        <div className="release-card__type">
          <div className="release-card__type-pill bg-white/5 animate-pulse">
            <div className="h-5 w-16" />
          </div>
        </div>
        <div>
          <div className="release-card__title">
            <div className="h-5 w-48 bg-white/5 rounded animate-pulse mb-1" />
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse italic" />
          </div>

          <div className="release-card__genres">
            <div className="release-card__genres-pill bg-white/5 animate-pulse">
              <div className="h-4 w-20" />
            </div>
            <div className="release-card__genres-pill bg-white/5 animate-pulse">
              <div className="h-4 w-24" />
            </div>
            <div className="release-card__genres-pill bg-white/5 animate-pulse">
              <div className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="release-card__details">
      <div className="release-card__details-container">
        <div className="release-card__info">
          <div className="release-card__info-row">
            <span className="release-card__info-label">Tracks</span>
            <div className="h-4 w-8 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="release-card__info-row">
            <span className="release-card__info-label">Released</span>
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="release-card__info-row">
            <span className="release-card__info-label">Label</span>
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        <div className="release-card__actions">
          <div className="release-card__links">
            <div className="release-card__link bg-white/5 animate-pulse rounded">
              <div className="h-4 w-16" />
            </div>
            <div className="release-card__link bg-white/5 animate-pulse rounded">
              <div className="h-4 w-24" />
            </div>
          </div>
          <div className="release-card__like w-[62px] h-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonWeeklyGroup = () => (
  <div className="my-6">
    <div className="mb-6">
      <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
    </div>
    <div className="release-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export function ReleaseList({
  releases,
  loading,
  showActions = true,
  hasMore,
  loadMore,
  showWeeklyGroups = false,
  onSelect,
}: ReleaseListProps) {
  // Deduplicate releases by ID
  const uniqueReleases = useMemo(() => {
    const seen = new Set<string>();
    return releases.filter((release) => {
      const key = `${release.id}-${release.created_by}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [releases]);

  const formatArtists = useCallback((release: Release) => {
    console.log('Release artists:', release.artists);
    if (!release.artists?.length) return "";
    return release.artists.map(ra => ra.artist.name).join(", ");
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }, []);

  const getWeekKey = useCallback((date: Date) => {
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (dayOfWeek + 2) % 7;
    const start = new Date(date);
    start.setDate(start.getDate() - daysUntilFriday);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }, []);

  const getWeekRange = useCallback(
    (date: Date) => {
      const dayOfWeek = date.getDay();
      const daysUntilFriday = (dayOfWeek + 2) % 7;
      const start = new Date(date);
      start.setDate(start.getDate() - daysUntilFriday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        start,
        end,
        key: start.toISOString(),
        label: `${formatDate(start.toISOString())} – ${formatDate(
          end.toISOString()
        )}`,
      };
    },
    [formatDate]
  );

  const { sortReleases } = useReleaseSorting(); // Get the sortReleases function from the hook

  const groupReleasesByWeek = useCallback(
    (releases: Release[]) => {
      const groups = new Map<string, Release[]>();
      const sortedReleases = [...releases].sort((a, b) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return dateB - dateA;
      });

      sortedReleases.forEach((release) => {
        const weekKey = getWeekKey(new Date(release.release_date));
        const group = groups.get(weekKey) || [];
        group.push(release);
        groups.set(weekKey, group);
      });

      return Array.from(groups.entries())
        .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
        .map(([key, releases]) => ({
          weekRange: getWeekRange(new Date(key)),
          releases: sortReleases(releases), // Sort releases within each week
        }));
    },
    [getWeekKey, getWeekRange, sortReleases]
  );

  const formatReleaseType = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case "single":
        return "Single";
      case "compilation":
        return "Compilation";
      default:
        return type;
    }
  }, []);

  const renderRelease = useCallback(
    (release: Release) => (
      <div
        key={`${release.id}-${release.created_by}`}
        className="release-card"
        onClick={() => onSelect?.(release)}
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
                {formatReleaseType(release.release_type) || "Album"}
              </div>
            </div>
            <div>
              <div className="release-card__title">
                <h2>{formatArtists(release)}</h2>
                <h2 className="italic">{release.name}</h2>
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

            <div className="release-card__actions">
              {showActions && (
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
                      Apple Music{" "}
                      <ExternalLinkArrow className="text-[#F1977E]" />
                    </a>
                  )}
                </div>
              )}
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
    ),
    [formatArtists, formatDate, formatReleaseType]
  );

  if (loading) {
    return (
      <div className="space-y-12">
        {showWeeklyGroups ? (
          <SkeletonWeeklyGroup />
        ) : (
          <div className="release-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!uniqueReleases) return null;

  return (
    <div className="space-y-8">
      {showWeeklyGroups ? (
        groupReleasesByWeek(uniqueReleases).map(({ weekRange, releases }) => (
          <div key={weekRange.key} className="relative">
            <div className="weekly-group-header">
              <div className="flex items-baseline gap-2 text-xl font-semibold">
                {weekRange.label}
                <span className="text-base font-normal text-white/60 ml-1">
                  {releases.length}{" "}
                  {releases.length === 1 ? "release" : "releases"}
                </span>
              </div>
            </div>
            <div className="release-grid mt-6">
              {releases.map(renderRelease)}
            </div>
          </div>
        ))
      ) : (
        <div className="release-grid">{uniqueReleases.map(renderRelease)}</div>
      )}

      {/* Load more button */}
      {hasMore && !loading && (
        <div className="col-span-full mt-8 flex justify-center">
          <Button onClick={() => loadMore?.()} disabled={loading}>
            {loading ? "Loading..." : "Load More Releases"}
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="col-span-full h-20 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        </div>
      )}
    </div>
  );
}
