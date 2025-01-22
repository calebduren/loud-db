import React from "react";
import { Release } from "../../types/database";
import { ReleaseList } from "./ReleaseList";
import {
  groupReleasesByWeek,
  formatWeekHeader,
} from "../../lib/dates/weekGrouping";
import { ReleaseSkeleton } from "./ReleaseSkeleton";
import { useReleaseSorting } from "../../hooks/useReleaseSorting";

interface WeeklyReleaseListProps {
  releases: Release[];
  loading?: boolean;
  showActions?: boolean;
  onEdit?: (release: Release) => void;
  onDelete?: () => void;
}

export function WeeklyReleaseList({
  releases,
  loading,
  showActions,
  onEdit,
  onDelete,
}: WeeklyReleaseListProps) {
  const { sortReleases, loading: sortingLoading } = useReleaseSorting();
  const weekGroups = React.useMemo(() => {
    return groupReleasesByWeek(releases, sortReleases);
  }, [releases, sortReleases]);

  const isLoading = loading || sortingLoading;

  if (!releases.length && isLoading) {
    // Create skeleton groups for loading state
    return (
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <section key={i}>
            <div className="h-8 bg-white/10 rounded w-48 mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, j) => (
                <ReleaseSkeleton key={j} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {weekGroups.map((group) => (
        <section key={group.weekStart.toISOString()} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">
            {formatWeekHeader(group.weekStart)}
          </h2>
          <ReleaseList
            releases={group.releases}
            loading={isLoading}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </section>
      ))}
    </div>
  );
}
