export function formatDate(dateString: string): string {
  // Parse the ISO date string directly
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatReleaseDate(dateString: string): string {
  // For release dates, parse as UTC and adjust for local timezone
  const [datePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatWeekDate(dateString: string): string {
  // Parse the ISO date string directly
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function adjustForTimezone(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}