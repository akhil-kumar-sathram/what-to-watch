/**
 * Official TMDB Genre Definition & Normalization Service
 * 
 * CORE PRINCIPLE:
 * TMDB is the sole source of truth for movie genres.
 * Mood and Genre are strictly decoupled:
 * - GENRE (TMDB metadata): Action, Drama, Comedy, Romance, Horror, Thriller, etc.
 * - MOOD (Gemini analysis): Feel-Good, Hopeful, Comforting, Heartbreaking, etc.
 * 
 * NEVER infer, invent, or reclassify a movie's genre based on its mood, title, or recommendation reason.
 */

export interface TMDBGenre {
  id: number;
  name: string;
}

export const OFFICIAL_TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi', // TMDB official name: "Science Fiction"
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Case-insensitive mapping from common user or catalog strings to official TMDB genre IDs
export const GENRE_NAME_TO_TMDB_ID: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  animated: 16,
  anime: 16,
  comedy: 35,
  comic: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10751,
  children: 10751,
  fantasy: 14,
  history: 36,
  historical: 36,
  period: 36,
  biography: 18, // Map to Drama (TMDB standard)
  horror: 27,
  scary: 27,
  music: 10402,
  musical: 10402,
  mystery: 9648,
  romance: 10749,
  romantic: 10749,
  'rom-com': 10749,
  'sci-fi': 878,
  'science fiction': 878,
  scifi: 878,
  'tv movie': 10770,
  thriller: 53,
  suspense: 53,
  war: 10752,
  western: 37,
};

// In-memory cache for TMDB genre list API response
let liveGenreCache: Map<number, string> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches the official movie genre list directly from TMDB's /genre/movie/list endpoint.
 * Falls back to OFFICIAL_TMDB_GENRES if network call fails or key is missing.
 */
export async function getLiveTMDBGenres(apiKey?: string): Promise<Map<number, string>> {
  if (liveGenreCache && Date.now() - lastCacheTime < CACHE_TTL_MS) {
    return liveGenreCache;
  }

  const key = apiKey || process.env.TMDB_API_KEY || '3fd2be6f0c70a2a598f084ddfb75487c';
  try {
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${key}&language=en-US`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.genres)) {
        const map = new Map<number, string>();
        for (const g of data.genres) {
          const cleanName = g.name === 'Science Fiction' ? 'Sci-Fi' : g.name;
          map.set(g.id, cleanName);
        }
        liveGenreCache = map;
        lastCacheTime = Date.now();
        return map;
      }
    }
  } catch (err: any) {
    console.warn('Could not fetch live TMDB genres, using official static map:', err?.message || err);
  }

  // Fallback to static official definitions
  const map = new Map<number, string>();
  for (const [idStr, name] of Object.entries(OFFICIAL_TMDB_GENRES)) {
    map.set(Number(idStr), name);
  }
  liveGenreCache = map;
  lastCacheTime = Date.now();
  return map;
}

/**
 * Normalizes a genre name, ID, or object into its official TMDB genre ID.
 * Returns null if the input cannot be mapped to a genuine TMDB genre.
 */
export function normalizeGenreToId(input: string | number | { id?: number; name?: string } | undefined | null): number | null {
  if (input === null || input === undefined) return null;

  if (typeof input === 'number') {
    return OFFICIAL_TMDB_GENRES[input] ? input : null;
  }

  if (typeof input === 'object') {
    if (typeof input.id === 'number' && OFFICIAL_TMDB_GENRES[input.id]) {
      return input.id;
    }
    if (typeof input.name === 'string') {
      return normalizeGenreToId(input.name);
    }
    return null;
  }

  if (typeof input !== 'string') return null;

  const clean = input.trim().toLowerCase();
  if (GENRE_NAME_TO_TMDB_ID[clean]) {
    return GENRE_NAME_TO_TMDB_ID[clean];
  }

  // Check partial matches
  for (const [key, id] of Object.entries(GENRE_NAME_TO_TMDB_ID)) {
    if (clean.includes(key) || key.includes(clean)) {
      return id;
    }
  }

  return null;
}

/**
 * Normalizes a list of genre names, IDs, or objects into a unique list of TMDB genre IDs.
 */
export function normalizeGenreIds(inputs: Array<string | number | { id?: number; name?: string }> | undefined | null): number[] {
  if (!Array.isArray(inputs)) return [];
  const ids = new Set<number>();
  for (const item of inputs) {
    const id = normalizeGenreToId(item);
    if (id !== null) {
      ids.add(id);
    }
  }
  return Array.from(ids);
}

/**
 * Retrieves the official TMDB genre name for a given TMDB genre ID.
 */
export function getTMDBGenreName(id: number): string {
  return OFFICIAL_TMDB_GENRES[id] || 'Film';
}

/**
 * Converts genre IDs and/or raw genre objects into standardized TMDB genre objects.
 * Format: Array<{ id: number, name: string }>
 */
export function formatTMDBGenreObjects(
  genreIds?: number[],
  rawGenres?: any[]
): Array<{ id: number; name: string }> {
  const result: Array<{ id: number; name: string }> = [];
  const seenIds = new Set<number>();

  if (Array.isArray(rawGenres)) {
    for (const g of rawGenres) {
      if (typeof g === 'object' && g !== null && typeof g.id === 'number') {
        if (!seenIds.has(g.id)) {
          seenIds.add(g.id);
          const name = g.name === 'Science Fiction' ? 'Sci-Fi' : (g.name || getTMDBGenreName(g.id));
          result.push({ id: g.id, name });
        }
      } else if (typeof g === 'string') {
        const id = normalizeGenreToId(g);
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          result.push({ id, name: getTMDBGenreName(id) });
        }
      }
    }
  }

  if (Array.isArray(genreIds)) {
    for (const id of genreIds) {
      if (typeof id === 'number' && !seenIds.has(id)) {
        seenIds.add(id);
        result.push({ id, name: getTMDBGenreName(id) });
      }
    }
  }

  return result;
}

/**
 * Extracts a clean string array of genre names from any movie genre representation.
 */
export function getGenreNameList(
  genres: Array<{ id: number; name: string } | string> | undefined | null
): string[] {
  if (!Array.isArray(genres)) return [];
  return genres
    .map((g) => {
      if (typeof g === 'string') return g;
      if (typeof g === 'object' && g !== null && typeof g.name === 'string') {
        return g.name === 'Science Fiction' ? 'Sci-Fi' : g.name;
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * Strictly verifies whether a movie satisfies the required genre constraints.
 * 
 * @param movieGenreIds - The array of TMDB genre IDs for the movie.
 * @param requiredGenreIds - The array of TMDB genre IDs the user asked for.
 * @param mode - 'any' (default: movie must contain at least one requested genre)
 *               or 'all' (movie must contain all requested genres).
 */
export function satisfiesGenreRequirement(
  movieGenreIds: number[],
  requiredGenreIds: number[],
  mode: 'any' | 'all' = 'any'
): boolean {
  if (!requiredGenreIds || requiredGenreIds.length === 0) {
    return true; // No genre restriction
  }

  if (!movieGenreIds || movieGenreIds.length === 0) {
    return false;
  }

  const movieSet = new Set(movieGenreIds);

  if (mode === 'all') {
    return requiredGenreIds.every((reqId) => movieSet.has(reqId));
  }

  // 'any' mode: movie must contain at least one of the required genres
  return requiredGenreIds.some((reqId) => movieSet.has(reqId));
}

/**
 * Checks whether a movie contains any excluded / avoided TMDB genre IDs.
 */
export function containsExcludedGenre(
  movieGenreIds: number[],
  excludedGenreIds: number[]
): boolean {
  if (!excludedGenreIds || excludedGenreIds.length === 0) {
    return false;
  }

  if (!movieGenreIds || movieGenreIds.length === 0) {
    return false;
  }

  const movieSet = new Set(movieGenreIds);
  return excludedGenreIds.some((exId) => movieSet.has(exId));
}
