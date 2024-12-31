/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Removing special characters
 * - Removing extra whitespace
 * - Removing diacritics
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    // Remove diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove special characters
    .replace(/[^a-z0-9\s]/g, '')
    // Normalize whitespace
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Checks if two strings are similar enough to be considered duplicates
 */
export function areSimilarStrings(str1: string, str2: string): boolean {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  // Check exact match after normalization
  if (norm1 === norm2) return true;
  
  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  
  // Allow for some fuzzy matching based on string length
  return distance <= Math.min(2, Math.floor(maxLength * 0.2));
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,  // substitution
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1       // insertion
        );
      }
    }
  }

  return dp[m][n];
}