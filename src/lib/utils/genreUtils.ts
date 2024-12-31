/**
 * Filters out invalid or unclassified genres
 */
export function filterValidGenres(genres: string[]): string[] {
  if (!genres || !Array.isArray(genres)) return [];
  
  return genres.filter(genre => 
    genre && 
    genre.toLowerCase() !== 'unclassified' && 
    genre.trim() !== ''
  );
}

/**
 * Normalizes genre names for consistency
 */
export function normalizeGenre(genre: string): string {
  return genre
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}