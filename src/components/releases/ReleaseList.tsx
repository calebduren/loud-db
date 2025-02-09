import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Release } from "../../types/database";
import { Music } from "lucide-react";
import { LikeButton } from "../LikeButton";
import { ExternalLinkArrow } from "../icons/ExternalLinkArrow";
import { Button } from "../ui/button";
import { Badge } from "../ui/Badge"; 
import { useReleaseSorting } from "../../hooks/useReleaseSorting"; 

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
}: ReleaseListProps) {
  console.log("ReleaseList render:", {
    releasesCount: releases?.length || 0,
    loading,
    hasMore,
    showWeeklyGroups,
    disableSorting,
    releases: releases?.map(r => ({
      id: r.id,
      name: r.name,
      artistCount: r.artists?.length || 0,
      genreCount: r.genres?.length || 0,
      artists: r.artists?.map(a => ({
        position: a.position,
        artistName: a.artist?.name,
        artistId: a.artist?.id
      })),
      genres: r.genres
    }))
  });

  // Show loading skeleton while loading
  if (loading) {
    console.log("Showing loading skeleton");
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ReleaseList.Skeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state only if not loading and no releases
  if (!releases || releases.length === 0) {
    console.log("No releases to display");
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-gray-500">No releases match your criteria</p>
      </div>
    );
  }

  const [sortingStabilized, setSortingStabilized] = useState(false);
  const { sortReleases } = useReleaseSorting();

  // Deduplicate releases by ID
  const uniqueReleases = useMemo(() => {
    const seen = new Set<string>();
    return releases.filter((release) => {
      const key = `${release.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [releases]);

  // Sort releases if needed
  const sortedReleases = useMemo(() => {
    if (disableSorting) return uniqueReleases;
    console.log("Sorting releases...");
    return sortReleases(uniqueReleases || []);
  }, [uniqueReleases, disableSorting, sortReleases]);

  console.log("Sorted releases:", {
    count: sortedReleases?.length || 0,
    firstRelease: sortedReleases?.[0] ? {
      id: sortedReleases[0].id,
      name: sortedReleases[0].name,
      artistCount: sortedReleases[0].artists?.length || 0,
      genreCount: sortedReleases[0].genres?.length || 0
    } : null
  });

  // Effect to handle sorting stabilization
  useEffect(() => {
    if (!loading && sortedReleases.length > 0) {
      const timer = setTimeout(() => {
        setSortingStabilized(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSortingStabilized(false);
    }
  }, [loading, sortedReleases]);

  const formatArtists = useCallback((release: Release) => {
    if (!Array.isArray(release.artists)) return "";
    
    return release.artists
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((a) => a.artist?.name || '')
      .filter(Boolean)
      .join(", ");
  }, []);

  const getGenres = useCallback((release: Release) => {
    const genres = [
      ...(release.genres || []),
      ...(release.release_genres?.map((rg) => rg.genres?.name).filter(Boolean) || [])
    ];
    return [...new Set(genres)];
  }, []);

  const getWeekKey = useCallback((date: Date) => {
    // Get the day of week (0 = Sunday, 5 = Friday)
    const dayOfWeek = date.getDay();

    // If it's before Friday, go back to previous Friday
    // If it's Friday or after, use this Friday
    const daysToSubtract =
      dayOfWeek < 5
        ? (dayOfWeek + 2) % 7 // Days back to previous Friday
        : dayOfWeek - 5; // Days back to this Friday

    const start = new Date(date);
    start.setDate(start.getDate() - daysToSubtract);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }, []);

  const getWeekRange = useCallback((date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      start,
      end,
      key: start.toISOString(),
      label: formatWeekDate(start),
    };
  }, []);

  const weeklyGroups = useMemo(() => {
    if (!showWeeklyGroups) return [];

    const groups = new Map<string, WeekGroup>();

    sortedReleases.forEach((release) => {
      const releaseDate = new Date(release.created_at);
      const weekKey = getWeekKey(releaseDate);

      if (!groups.has(weekKey)) {
        groups.set(weekKey, {
          weekRange: getWeekRange(releaseDate),
          releases: [],
        });
      }

      groups.get(weekKey)?.releases.push(release);
    });

    return Array.from(groups.values());
  }, [sortedReleases, showWeeklyGroups, getWeekKey, getWeekRange]);

  const isLoading = loading || !sortingStabilized;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        {showWeeklyGroups ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonWeeklyGroup key={i} />
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show weekly groups
  if (showWeeklyGroups) {
    return (
      <div className="space-y-8">
        {weeklyGroups.map((group) => (
          <div key={group.weekRange.key} className="space-y-4">
            <h2 className="text-lg font-medium">{group.weekRange.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.releases.map((release) => renderRelease(release))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show grid layout
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedReleases.map((release) => renderRelease(release))}
    </div>
  );

  function renderRelease(release: Release) {
    return (
      <div
        key={`${release.id}`}
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
                {release.release_type}
              </div>
            </div>
            <div>
              <h2 className="release-card__artist">{formatArtists(release)}</h2>
              <h2 className="release-card__title">{release.name}</h2>

              {getGenres(release).length > 0 && (
                <div className="release-card__genres">
                  {getGenres(release).slice(0, 3).map((genre) => (
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
              {release.track_count > 0 && (
                <div className="release-card__info-row">
                  <div className="release-card__info-label">Tracks</div>
                  <div className="release-card__info-value">{release.track_count}</div>
                </div>
              )}
              {release.release_date && (
                <div className="release-card__info-row">
                  <div className="release-card__info-label">Released</div>
                  <div className="release-card__info-value">
                    {new Date(release.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
              {release.record_label && (
                <div className="release-card__info-row">
                  <div className="release-card__info-label">Label</div>
                  <div className="release-card__info-value">{release.record_label}</div>
                </div>
              )}
            </div>

            {showActions && (
              <div className="release-card__actions">
                <div className="release-card__links">
                  {release.spotify_url && (
                    <a
                      href={release.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="release-card__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Spotify</span>
                      <ExternalLinkArrow className="w-4 h-4" />
                    </a>
                  )}
                  {release.apple_music_url && (
                    <a
                      href={release.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="release-card__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Apple Music</span>
                      <ExternalLinkArrow className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {release.spotify_url || release.apple_music_url ? <div className="release-card__divider" /> : null}
                <div className="release__like">
                  <LikeButton releaseId={release.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ReleaseList.Skeleton = SkeletonCard;

export default ReleaseList;
