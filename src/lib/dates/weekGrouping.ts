export function getWeekStart(date: Date): Date {
  const day = date.getDay();
  // If day is before Friday (5), go back to previous Friday
  // If day is Friday or after, use current Friday
  const daysToSubtract = day < 5 ? (day + 2) : (day - 5);
  const result = new Date(date);
  result.setDate(date.getDate() - daysToSubtract);
  return result;
}

export function formatWeekHeader(date: Date): string {
  return `Week of ${date.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;
}

export interface WeekGroup {
  weekStart: Date;
  releases: Release[];
}

export function groupReleasesByWeek(releases: Release[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();

  releases.forEach(release => {
    const releaseDate = new Date(release.release_date);
    const weekStart = getWeekStart(releaseDate);
    const key = weekStart.toISOString();

    if (!groups.has(key)) {
      groups.set(key, {
        weekStart,
        releases: []
      });
    }

    groups.get(key)?.releases.push(release);
  });

  // Sort weeks in descending order
  return Array.from(groups.values())
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
}