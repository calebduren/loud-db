import { ReleaseType } from '../../types/database';

export function parseReleaseType(type: string): ReleaseType {
  if (!type) return 'LP';
  
  const normalized = type.toLowerCase();
  if (normalized.includes('single')) return 'single';
  if (normalized.includes('ep')) return 'EP';
  if (normalized.includes('compilation') || normalized.includes('various')) return 'compilation';
  return 'LP';
}

export function parseGenres(genres: string): string[] {
  if (!genres || genres === 'Unknown') return ['Unclassified'];
  
  return genres
    .split(/[,|&]/) // Split on comma, pipe, or ampersand
    .map(g => g.trim())
    .filter(Boolean)
    .map(g => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
}

export function parseDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString();
  
  try {
    // Handle various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing common formats (MM/DD/YYYY, DD-MM-YYYY, etc)
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        // Try different date part arrangements
        for (const arrangement of [[2,0,1], [0,1,2], [1,0,2]]) {
          const [year, month, day] = arrangement.map(i => parseInt(parts[i]));
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) return date.toISOString();
        }
      }
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}