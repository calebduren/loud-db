import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Release } from "../../types/database";
import { Music } from "lucide-react";
import { LikeButton } from "../LikeButton";
import { ExternalLinkArrow } from "../icons/ExternalLinkArrow";
import { useReleaseSorting } from "../../hooks/useReleaseSorting";
import { useGenrePreferences } from "../../hooks/settings/useGenrePreferences";
import { useGenreGroups } from "../../hooks/useGenreGroups";
import { useRecommendedReleases } from "../../hooks/useRecommendedReleases";
import { formatDate, formatWeekDate } from "../../lib/utils/dateUtils";
import { Button } from "../ui/button";
import { Badge } from "../ui/Badge";

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
  disableSorting?: boolean;
  onSelect?: (release: Release) => void;
  onEdit?: (release: Release) => void;
  onDelete?: (release: Release) => void;
}

const SkeletonCard = () => (
  <div className="release-card">
    <div className="release-card__cover">
      <div className="release-card__image-container bg-white/5">
        <div className="release-card__placeholder">
          <Music className="w-12 h-12 text-gray-700" />
        </div>
        <div className="release-card__gradient" />
      </div>

      <div className="release-card__content">
        <div className="release-card__type">
          <div className="pill pill--release-type bg-white/5 animate-pulse h-[25px] w-8"></div>
        </div>
        <div>
          <div className="release-card__artist h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="release-card__title h-6 w-32 bg-white/5 rounded-lg animate-pulse" />

          <div className="release-card__genres">
            <div className="pill pill--genre bg-white/5 animate-pulse h-[25px] w-16"></div>
            <div className="pill pill--genre bg-white/5 animate-pulse h-[25px] w-20"></div>
            <div className="pill pill--genre bg-white/5 animate-pulse h-[25px] w-8"></div>
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
          <div className="release__like w-[62px] h-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonWeeklyGroup = () => (
  <div className="my-6">
    <div className="mb-3">
      <div className="h-[28px] w-64 bg-white/5 rounded-lg animate-pulse" />
    </div>
    <div className="release-grid">
      {Array.from({ length: 21 }).map((_, i) => (
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
  disableSorting = false,
  onSelect,
  onEdit,
  onDelete,
}: ReleaseListProps) {
  const [sortingStabilized, setSortingStabilized] = useState(false);
  const { preferences, loading: preferencesLoading } = useGenrePreferences();
  const { genreGroups, loading: groupsLoading } = useGenreGroups();
  const { sortReleases } = useReleaseSorting();

  const uniqueReleases = useMemo(() => {
    const seen = new Set<string>();
    return releases.filter((release) => {
      const key = `${release.id}-${release.created_by}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [releases]);

  const sortedReleases = useMemo(() => {
    if (disableSorting) {
      return uniqueReleases;
    }
    if (!uniqueReleases || preferencesLoading || groupsLoading) return [];
    return sortReleases(uniqueReleases);
  }, [
    uniqueReleases,
    sortReleases,
    disableSorting,
    preferencesLoading,
    groupsLoading,
  ]);

  useEffect(() => {
    if (
      !loading &&
      !preferencesLoading &&
      !groupsLoading &&
      sortedReleases.length > 0
    ) {
      const timer = setTimeout(() => {
        setSortingStabilized(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSortingStabilized(false);
    }
  }, [loading, preferencesLoading, groupsLoading, sortedReleases]);

  const formatArtists = useCallback((release: Release) => {
    if (!Array.isArray(release.artists)) return "";

    return release.artists
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((a) => a.artist?.name || "")
      .filter(Boolean)
      .join(", ");
  }, []);

  const getWeekRange = useCallback((date: Date) => {
    const dayOfWeek = date.getUTCDay();

    const daysToSubtract = dayOfWeek < 5 ? (dayOfWeek + 2) % 7 : dayOfWeek - 5;

    const start = new Date(date.getTime());
    start.setUTCDate(start.getUTCDate() - daysToSubtract);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start.getTime());
    end.setUTCDate(end.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);

    return {
      start,
      end,
      key: start.toISOString(),
      label: `${formatWeekDate(start.toISOString())} – ${formatWeekDate(
        end.toISOString()
      )}`,
    };
  }, []);

  const weekGroups = useMemo(() => {
    if (!sortedReleases.length || !sortingStabilized) return [];

    const groups = new Map<string, WeekGroup>();

    sortedReleases.forEach((release) => {
      if (!release.release_date) return;

      // Parse the ISO date string directly
      const releaseDate = new Date(release.release_date);
      if (isNaN(releaseDate.getTime())) return;

      const weekRange = getWeekRange(releaseDate);

      if (!groups.has(weekRange.key)) {
        groups.set(weekRange.key, {
          weekRange,
          releases: [],
        });
      }

      groups.get(weekRange.key)?.releases.push(release);
    });

    return Array.from(groups.values()).sort(
      (a, b) => b.weekRange.start.getTime() - a.weekRange.start.getTime()
    );
  }, [sortedReleases, getWeekRange, sortingStabilized]);

  const formatReleaseType = useCallback((type: string | null) => {
    if (!type) return "Album";
    switch (type.toLowerCase()) {
      case "single":
        return "Single";
      case "compilation":
        return "Compilation";
      default:
        return type;
    }
  }, []);

  const recommendedReleases = useRecommendedReleases(uniqueReleases);
  const isRecommended = useCallback(
    (release: Release) => {
      // Consider a release recommended if it's in the top 3 recommended releases
      return recommendedReleases.slice(0, 3).some((r) => r.id === release.id);
    },
    [recommendedReleases]
  );

  const renderRelease = useCallback(
    (release: Release) => (
      <div
        key={`${release.id}-${release.created_by}`}
        className="release-card"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect?.(release);
        }}
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
              <div className="pill pill--release-type">
                {formatReleaseType(release.release_type)}
              </div>
              {isRecommended(release) && (
                <Badge variant="recommended">Top Rec</Badge>
              )}
            </div>
            <div>
              <h2 className="release-card__artist">{formatArtists(release)}</h2>
              <h2 className="release-card__title">{release.name}</h2>

              {(release.genres?.length ?? 0) > 0 && (
                <div className="release-card__genres">
                  {release.genres?.slice(0, 3).map((genre) => (
                    <div key={genre} className="pill pill--genre">
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
                  {release.track_count || 0}
                </span>
              </div>
              <div className="release-card__info-row">
                <span className="release-card__info-label">Released</span>
                <span className="release-card__info-value">
                  {release.release_date ? formatDate(release.release_date) : '-'}
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
                  <div>
                    {release.spotify_url && (
                      <a
                        href={release.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="release-card__link"
                      >
                        Spotify <ExternalLinkArrow />
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
                        Apple Music <ExternalLinkArrow />
                      </a>
                    )}
                  </div>
                </div>
              )}
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
    ),
    [formatArtists, formatDate, formatReleaseType, isRecommended, onSelect]
  );

  if (loading || preferencesLoading || groupsLoading || !sortingStabilized) {
    return (
      <div className="space-y-8">
        {showWeeklyGroups ? (
          Array.from({ length: 2 }).map((_, i) => (
            <SkeletonWeeklyGroup key={i} />
          ))
        ) : (
          <div className="release-grid">
            {Array.from({ length: 12 }).map((_, i) => (
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
        weekGroups.map(({ weekRange, releases }) => (
          <div key={weekRange.key}>
            <div className="weekly-group-header">
              {weekRange.label}
              <span className="text-base font-normal text-white/60 ml-1">
                {releases.length}{" "}
                {releases.length === 1 ? "release" : "releases"}
              </span>
            </div>
            <div className="release-grid mt-3">
              {releases.map(renderRelease)}
            </div>
          </div>
        ))
      ) : (
        <div className="release-grid">{sortedReleases.map(renderRelease)}</div>
      )}

      {hasMore && !loading && (
        <div className="col-span-full mt-8 flex justify-center">
          <Button onClick={() => loadMore?.()} disabled={loading}>
            {loading ? "Loading..." : "Load More Releases"}
          </Button>
        </div>
      )}

      {loading && (
        <div className="col-span-full h-20 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        </div>
      )}
    </div>
  );
}

ReleaseList.Skeleton = SkeletonCard;

export default ReleaseList;
