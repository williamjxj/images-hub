/**
 * Search utilities for fuzzy search, typo tolerance, and popular searches
 */

/**
 * Popular search terms used as fallback when user has no recent search history
 */
const POPULAR_SEARCHES = [
  "nature",
  "business",
  "technology",
  "people",
  "architecture",
  "travel",
  "food",
  "animals",
  "abstract",
  "landscape",
  "city",
  "ocean",
  "sunset",
  "mountains",
  "flowers",
];

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy search and typo tolerance
 *
 * @param a First string
 * @param b Second string
 * @returns Edit distance (number of character changes needed)
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Create matrix
  const matrix: number[][] = Array(aLen + 1)
    .fill(null)
    .map(() => Array(bLen + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= aLen; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[aLen][bLen];
}

/**
 * Find similar searches using Levenshtein distance
 *
 * @param query Search query
 * @param candidates Array of candidate search terms
 * @param maxDistance Maximum edit distance allowed (default: 2)
 * @returns Array of similar search terms sorted by similarity
 */
export function findSimilarSearches(
  query: string,
  candidates: string[],
  maxDistance = 2
): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();

  return candidates
    .map((candidate) => ({
      candidate,
      distance: levenshteinDistance(queryLower, candidate.toLowerCase()),
    }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map(({ candidate }) => candidate)
    .slice(0, 5); // Return top 5 matches
}

/**
 * Get popular search terms
 *
 * @returns Array of popular search terms
 */
export function getPopularSearches(): string[] {
  return [...POPULAR_SEARCHES];
}

/**
 * Filter searches by query (case-insensitive substring match)
 *
 * @param query Search query
 * @param candidates Array of candidate search terms
 * @returns Array of matching search terms
 */
export function filterSearchesByQuery(
  query: string,
  candidates: string[]
): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();

  return candidates
    .filter((candidate) => candidate.toLowerCase().includes(queryLower))
    .slice(0, 10); // Return top 10 matches
}
