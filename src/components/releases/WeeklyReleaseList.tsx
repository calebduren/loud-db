import React from "react";
import { Release } from "../../types/database";
import ReleaseList from "./ReleaseList";
import {
  groupReleasesByWeek,
  formatWeekHeader,
} from "../../lib/dates/weekGrouping";
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
            <ReleaseList.Skeleton key={i} />
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
