import { Release } from "@/types/database";

export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  // Get to Friday
  const day = result.getDay(); // 0 = Sunday, 5 = Friday
  if (day < 5) {
    // If before Friday, go back to previous Friday
    result.setDate(result.getDate() - (day + 2));
  } else if (day > 5) {
    // If after Friday, go back to this Friday
    result.setDate(result.getDate() - (day - 5));
  }
  // If it's Friday (day === 5), we're already on the right day

  return result;
}

export function formatWeekHeader(date: Date): string {
  const weekStart = new Date(date);
  const weekEnd = new Date(date);
  weekEnd.setDate(weekStart.getDate() + 6); // Add 6 days to get to Thursday

  // Format start date
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
  const startDay = weekStart.getDate();

  // Format end date
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
  const endDay = weekEnd.getDate();

  // If months are different, include both months
  if (startMonth !== endMonth) {
    return `${startMonth} ${startDay} to ${endMonth} ${endDay}`;
  }

  // If same month, only show month once
  return `${startMonth} ${startDay} to ${endDay}`;
}

export interface WeekGroup {
  weekStart: Date;
  releases: Release[];
}

export function groupReleasesByWeek(
  releases: Release[],
  sortFn?: (releases: Release[]) => Release[]
): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();

  // First, group all releases by week
  releases.forEach((release) => {
    const releaseDate = new Date(release.release_date);
    const weekStart = getWeekStart(releaseDate);
    const key = weekStart.toISOString();

    if (!groups.has(key)) {
      groups.set(key, {
        weekStart,
        releases: [],
      });
    }

    groups.get(key)?.releases.push(release);
  });

  // Then sort releases within each group if a sort function is provided
  if (sortFn) {
    console.log("Sorting releases within weeks...");
    for (const group of groups.values()) {
      console.log(
        `Week of ${group.weekStart.toISOString()}: ${
          group.releases.length
        } releases`
      );
      group.releases = sortFn(group.releases);
      // Log the first few releases after sorting to verify order
      console.log(
        "First few releases after sorting:",
        group.releases.slice(0, 5).map((r) => ({
          name: r.name,
          hasGenres: !!r.genres?.length,
          genres: r.genres,
        }))
      );
    }
  }

  // Sort weeks in descending order
  return Array.from(groups.values()).sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
  );
}
