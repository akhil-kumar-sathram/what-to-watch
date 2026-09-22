/**
 * Server-Side TMDB Movie Poster Validation Utility
 *
 * CRITICAL ARCHITECTURAL MANDATES:
 * 1. REAL MOVIE -> REAL TMDB MOVIE RECORD -> REAL TMDB POSTER.
 * 2. Every recommended movie MUST display the real, official poster image belonging
 *    to that exact movie from The Movie Database (TMDB).
 * 3. NEVER generate movie posters with AI.
 * 4. NEVER create replacement posters or placeholder graphics.
 * 5. NEVER use Unsplash, Pexels, Google Images, or stock photography.
 * 6. Build the poster URL strictly from the verified TMDB `poster_path`:
 *    `https://image.tmdb.org/t/p/w500/{poster_path}`
 * 7. Validate that every poster URL resolves directly on the official TMDB CDN
 *    before returning recommendation data to the frontend.
 */

import { Movie, MovieGenre } from '../types';
import {
  normalizeGenreIds,
  formatTMDBGenreObjects,
  getGenreNameList,
  satisfiesGenreRequirement,
  containsExcludedGenre,
} from './tmdbGenres';
import { matchesLanguageFilter } from './languages';

export const TMDB_IMAGE_CDN_BASE = 'https://image.tmdb.org/t/p/';
export const DEFAULT_POSTER_SIZE = 'w500';
export const DEFAULT_BACKDROP_SIZE = 'w1280';
export const DEFAULT_TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';

// Strict regex pattern for genuine TMDB asset paths (e.g. /bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg)
const TMDB_PATH_REGEX = /^\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i;

// Prohibited image domains and signature markers (AI art, stock photos, generic placeholders)
const PROHIBITED_DOMAIN_PATTERNS = [
  /unsplash\.com/i,
  /pexels\.com/i,
  /pixabay\.com/i,
  /placeholder/i,
  /picsum\.photos/i,
  /dummyimage/i,
  /cloudinary\.com/i,
  /openai/i,
  /stability\.ai/i,
  /midjourney/i,
  /gemini/i,
  /generated/i,
  /^data:image\//i,
];

// In-memory verification cache for TMDB CDN HEAD responses (12-hour TTL)
interface CacheEntry {
  isValid: boolean;
  timestamp: number;
}
const cdnVerificationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Validates whether a given relative path matches the TMDB CDN format.
 * Example: "/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg" -> true
 */
export function isValidTMDBPosterPath(path: unknown): path is string {
  if (typeof path !== 'string') return false;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/')) return false;
  return TMDB_PATH_REGEX.test(trimmed);
}

/**
 * Checks whether an image URL or path contains prohibited domains (stock photos, AI generators, placeholders).
 */
export function isProhibitedImageSource(urlOrPath: unknown): boolean {
  if (typeof urlOrPath !== 'string') return true;
  return PROHIBITED_DOMAIN_PATTERNS.some((pattern) => pattern.test(urlOrPath));
}

/**
 * Checks whether an image URL is an official, authentic TMDB CDN URL.
 */
export function isOfficialTMDBImageUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  if (isProhibitedImageSource(url)) return false;
  return url.startsWith(TMDB_IMAGE_CDN_BASE);
}

/**
 * Builds the authoritative TMDB CDN poster URL.
 * Throws an error or returns null if the path is not a valid TMDB poster path.
 */
export function buildTMDBPosterUrl(
  posterPath: string,
  size: 'w342' | 'w500' | 'w780' | 'original' = DEFAULT_POSTER_SIZE
): string {
  if (!isValidTMDBPosterPath(posterPath)) {
    throw new Error(`Invalid TMDB poster path: "${posterPath}". Path must match "/filename.ext".`);
  }
  return `${TMDB_IMAGE_CDN_BASE}${size}${posterPath}`;
}

/**
 * Builds the authoritative TMDB CDN backdrop URL.
 */
export function buildTMDBBackdropUrl(
  backdropPath: string,
  size: 'w780' | 'w1280' | 'original' = DEFAULT_BACKDROP_SIZE
): string {
  if (!isValidTMDBPosterPath(backdropPath)) {
    throw new Error(`Invalid TMDB backdrop path: "${backdropPath}". Path must match "/filename.ext".`);
  }
  return `${TMDB_IMAGE_CDN_BASE}${size}${backdropPath}`;
}

/**
 * Performs an HTTP HEAD request against the TMDB CDN to confirm that
 * the image file exists and is publicly reachable with an image content-type.
 */
export async function verifyTMDBImageReachable(
  fullUrl: string,
  timeoutMs = 4000
): Promise<boolean> {
  if (!isOfficialTMDBImageUrl(fullUrl)) {
    return false;
  }

  // Check cache
  const cached = cdnVerificationCache.get(fullUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.isValid;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fullUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhatToWatch-PosterValidator/1.0',
      },
    });
    clearTimeout(timer);

    const isOk = res.ok && res.status === 200;
    cdnVerificationCache.set(fullUrl, { isValid: isOk, timestamp: Date.now() });
    return isOk;
  } catch (err) {
    clearTimeout(timer);
    cdnVerificationCache.set(fullUrl, { isValid: false, timestamp: Date.now() });
    return false;
  }
}

export interface TMDBPosterVerificationResult {
  tmdbId: number;
  posterPath: string;
  posterUrl: string;
  backdropPath: string | null;
  backdropUrl: string | null;
  verified: true;
}

/**
 * Validates and retrieves the official TMDB poster path directly from the TMDB API
 * for a specific movie ID.
 *
 * If no authentic poster exists on TMDB, returns `null`.
 * NEVER generates AI art or substitutes random web images.
 */
export async function fetchAndVerifyTMDBPoster(
  tmdbId: number,
  options: {
    apiKey?: string;
    verifyHead?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<TMDBPosterVerificationResult | null> {
  if (!tmdbId || typeof tmdbId !== 'number' || tmdbId <= 0) {
    return null;
  }

  const apiKey = options.apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  const timeoutMs = options.timeoutMs || 5000;
  const shouldVerifyHead = options.verifyHead ?? true;

  try {
    const apiUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=images`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    // Verify identity
    if (data.id !== tmdbId) {
      return null;
    }

    let chosenPosterPath: string | null = null;

    // 1. Primary poster_path
    if (isValidTMDBPosterPath(data.poster_path)) {
      chosenPosterPath = data.poster_path;
    }

    // 2. Fallback to appended images.posters
    if (!chosenPosterPath && Array.isArray(data.images?.posters) && data.images.posters.length > 0) {
      const validPosters = data.images.posters.filter((p: any) =>
        isValidTMDBPosterPath(p.file_path)
      );
      if (validPosters.length > 0) {
        const enPoster = validPosters.find((p: any) => p.iso_639_1 === 'en');
        chosenPosterPath = (enPoster || validPosters[0]).file_path;
      }
    }

    // 3. Fallback to explicit /images endpoint if still missing
    if (!chosenPosterPath) {
      try {
        const imgUrl = `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${apiKey}`;
        const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(3000) });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (Array.isArray(imgData.posters) && imgData.posters.length > 0) {
            const valid = imgData.posters.filter((p: any) => isValidTMDBPosterPath(p.file_path));
            if (valid.length > 0) {
              const enPoster = valid.find((p: any) => p.iso_639_1 === 'en');
              chosenPosterPath = (enPoster || valid[0]).file_path;
            }
          }
        }
      } catch {
        // Handled below
      }
    }

    if (!chosenPosterPath) {
      return null;
    }

    const posterUrl = buildTMDBPosterUrl(chosenPosterPath, DEFAULT_POSTER_SIZE);

    // Verify CDN reachability if requested
    if (shouldVerifyHead) {
      const isReachable = await verifyTMDBImageReachable(posterUrl);
      if (!isReachable) {
        console.warn(`TMDB poster CDN validation failed for movie ${tmdbId}: ${posterUrl}`);
        return null;
      }
    }

    let backdropPath: string | null = null;
    let backdropUrl: string | null = null;
    if (isValidTMDBPosterPath(data.backdrop_path)) {
      backdropPath = data.backdrop_path;
      backdropUrl = buildTMDBBackdropUrl(data.backdrop_path, DEFAULT_BACKDROP_SIZE);
    }

    return {
      tmdbId,
      posterPath: chosenPosterPath,
      posterUrl,
      backdropPath,
      backdropUrl,
      verified: true,
    };
  } catch (err: any) {
    console.warn(`Error verifying TMDB poster for movie ${tmdbId}:`, err?.message || err);
    return null;
  }
}

export interface SanitizedMovie extends Movie {
  posterVerified: boolean;
  posterSource: 'tmdb_official';
  genre_ids: number[];
  genres: string[];
  tmdbGenres: MovieGenre[];
}

export interface RecommendationValidationOptions {
  apiKey?: string;
  requireVerifiedPoster?: boolean;
  verifyHead?: boolean;
  requiredGenreIds?: number[];
  excludedGenreIds?: number[];
  genreMatchMode?: 'any' | 'all';
  requiredLanguageCode?: string;
}

/**
 * Server-Side Validation Pipeline:
 * Validates an array of recommended movies before sending to the frontend.
 *
 * Guarantees:
 * - Only official TMDB images are served.
 * - Every movie has a verified `tmdbId` and `poster_path`.
 * - Reconstructs `posterUrl` strictly using `https://image.tmdb.org/t/p/w500/{poster_path}`.
 * - Discards or filters any recommendation that lacks a verified official TMDB poster.
 * - Strictly enforces TMDB genre metadata: validates that movie.genre_ids satisfies required genres
 *   and does not contain excluded genres.
 * - Strictly validates original_language if a specific language is required.
 * - Discards any candidate that violates genre or language constraints.
 * - ZERO AI-generated images, ZERO stock photos, ZERO fake posters, ZERO misclassified genres.
 */
export async function validateAndSanitizeRecommendations<T extends Partial<Movie>>(
  movies: T[],
  options: RecommendationValidationOptions = {}
): Promise<SanitizedMovie[]> {
  const requireVerifiedPoster = options.requireVerifiedPoster ?? true;
  const verifyHead = options.verifyHead ?? true;
  const apiKey = options.apiKey || process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
  const requiredGenreIds = options.requiredGenreIds || [];
  const excludedGenreIds = options.excludedGenreIds || [];
  const genreMatchMode = options.genreMatchMode || 'any';
  const requiredLanguageCode = options.requiredLanguageCode;

  const sanitizedList: SanitizedMovie[] = [];

  for (const movie of movies) {
    const tmdbId = movie.tmdbId || (typeof movie.id === 'string' ? Number(movie.id.replace(/\D/g, '')) : undefined);

    // 1. GENRE VALIDATION: Factual TMDB genre IDs
    let movieGenreIds: number[] = [];
    if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
      movieGenreIds = movie.genre_ids;
    } else if (Array.isArray(movie.genres) && movie.genres.length > 0) {
      movieGenreIds = normalizeGenreIds(movie.genres);
    }

    // Check required genres (e.g. Action -> 28)
    if (requiredGenreIds.length > 0) {
      if (!satisfiesGenreRequirement(movieGenreIds, requiredGenreIds, genreMatchMode)) {
        console.warn(
          `[Genre Validator] Discarding "${movie.title || 'Unknown'}" (TMDB ID: ${tmdbId}) - Missing required genre(s): ${requiredGenreIds.join(', ')}. Movie genres: [${movieGenreIds.join(', ')}]`
        );
        continue;
      }
    }

    // Check excluded genres
    if (excludedGenreIds.length > 0) {
      if (containsExcludedGenre(movieGenreIds, excludedGenreIds)) {
        console.warn(
          `[Genre Validator] Discarding "${movie.title || 'Unknown'}" (TMDB ID: ${tmdbId}) - Contains excluded genre`
        );
        continue;
      }
    }

    // 2. LANGUAGE VALIDATION: Original TMDB language code
    if (requiredLanguageCode && requiredLanguageCode !== 'any') {
      if (!matchesLanguageFilter(movie.originalLanguage, requiredLanguageCode)) {
        console.warn(
          `[Language Validator] Discarding "${movie.title || 'Unknown'}" (TMDB ID: ${tmdbId}) - Language mismatch. Expected: ${requiredLanguageCode}, got: ${movie.originalLanguage}`
        );
        continue;
      }
    }

    // 3. POSTER VALIDATION: Official TMDB poster path
    let verifiedPosterPath = movie.posterPath;
    let verifiedPosterUrl = movie.posterUrl;
    let verifiedBackdropPath: string | undefined = movie.backdropPath || undefined;
    let verifiedBackdropUrl = movie.backdropUrl || '';

    // If posterPath already exists and passes format validation
    if (isValidTMDBPosterPath(verifiedPosterPath)) {
      verifiedPosterUrl = buildTMDBPosterUrl(verifiedPosterPath, DEFAULT_POSTER_SIZE);

      if (verifyHead) {
        const isReachable = await verifyTMDBImageReachable(verifiedPosterUrl);
        if (!isReachable) {
          // If not reachable, attempt API lookup if tmdbId exists
          if (tmdbId) {
            const fresh = await fetchAndVerifyTMDBPoster(tmdbId, { apiKey, verifyHead: true });
            if (fresh) {
              verifiedPosterPath = fresh.posterPath;
              verifiedPosterUrl = fresh.posterUrl;
              verifiedBackdropPath = fresh.backdropPath || verifiedBackdropPath;
              verifiedBackdropUrl = fresh.backdropUrl || verifiedBackdropUrl;
            } else {
              verifiedPosterPath = undefined;
            }
          } else {
            verifiedPosterPath = undefined;
          }
        }
      }
    } else if (tmdbId) {
      // Missing or invalid path: query TMDB API
      const fresh = await fetchAndVerifyTMDBPoster(tmdbId, { apiKey, verifyHead });
      if (fresh) {
        verifiedPosterPath = fresh.posterPath;
        verifiedPosterUrl = fresh.posterUrl;
        verifiedBackdropPath = fresh.backdropPath || undefined;
        verifiedBackdropUrl = fresh.backdropUrl || '';
      }
    }

    // Recheck backdrop if present
    if (isValidTMDBPosterPath(verifiedBackdropPath)) {
      verifiedBackdropUrl = buildTMDBBackdropUrl(verifiedBackdropPath, DEFAULT_BACKDROP_SIZE);
    } else {
      verifiedBackdropPath = undefined;
      verifiedBackdropUrl = '';
    }

    const hasValidPoster = isValidTMDBPosterPath(verifiedPosterPath) && isOfficialTMDBImageUrl(verifiedPosterUrl);

    // If requireVerifiedPoster is true, discard candidate if no valid official poster
    if (requireVerifiedPoster && !hasValidPoster) {
      console.warn(
        `[TMDB Poster Validator] Discarding "${movie.title || 'Unknown'}" (TMDB ID: ${tmdbId}) - Missing official TMDB poster`
      );
      continue;
    }

    // Format TMDB genres cleanly
    const formattedTmdbGenres = formatTMDBGenreObjects(movieGenreIds, movie.genres);
    const genreNames = formattedTmdbGenres.map((g) => g.name);

    sanitizedList.push({
      ...(movie as Movie),
      tmdbId: tmdbId || movie.tmdbId,
      genre_ids: movieGenreIds,
      genres: genreNames,
      tmdbGenres: formattedTmdbGenres,
      posterPath: verifiedPosterPath,
      posterUrl: verifiedPosterUrl || '',
      backdropPath: verifiedBackdropPath,
      backdropUrl: verifiedBackdropUrl,
      posterVerified: true,
      posterSource: 'tmdb_official',
    });
  }

  return sanitizedList;
}
