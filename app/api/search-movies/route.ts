import { NextResponse } from 'next/server';
import { toTmdbLanguageCode, getLanguageDisplayName, matchesLanguageFilter } from '../../../src/utils/languages';
import { OFFICIAL_TMDB_GENRES, normalizeGenreIds } from '../../../src/utils/tmdbGenres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const languageParam = searchParams.get('language') || searchParams.get('lang');
    const genreParam = searchParams.get('genre');
    const yearParam = searchParams.get('year');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required.', results: [], total_results: 0 },
        { status: 400 }
      );
    }

    if (query.length > 200) {
      return NextResponse.json(
        { error: 'Search query exceeds maximum length of 200 characters.' },
        { status: 400 }
      );
    }

    const tmdbKey = process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
    if (!tmdbKey) {
      return NextResponse.json(
        { error: 'Movie data is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const targetLangCode = toTmdbLanguageCode(languageParam);
    const targetGenreId = genreParam ? normalizeGenreIds([genreParam])[0] : null;
    const targetYear = yearParam ? parseInt(yearParam, 10) : null;

    // TMDB /search/movie supports searching in any language, matching translated, alternative, and original titles
    const params = new URLSearchParams({
      api_key: tmdbKey,
      query,
      include_adult: 'false',
      page: String(page),
      language: 'en-US',
    });

    if (targetYear && !isNaN(targetYear)) {
      params.set('primary_release_year', String(targetYear));
    }

    const searchUrl = `https://api.themoviedb.org/3/search/movie?${params.toString()}`;
    const res = await fetchWithTimeout(searchUrl);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`TMDB search failed with status ${res.status}: ${errText.slice(0, 100)}`);
      return NextResponse.json(
        { error: 'Movie search is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawResults: any[] = Array.isArray(data.results) ? data.results : [];

    // Filter and map real TMDB movie items
    let filteredResults = rawResults
      .filter((r) => {
        if (!r.id || !r.title) return false;

        // Language filter (if user specified one)
        if (targetLangCode && !matchesLanguageFilter(r.original_language, targetLangCode)) {
          return false;
        }

        // Genre filter (if user specified one)
        if (targetGenreId && Array.isArray(r.genre_ids)) {
          if (!r.genre_ids.includes(targetGenreId)) {
            return false;
          }
        }

        return true;
      });

    let broadenedSearch = false;
    let fallbackNote: string | null = null;

    // If 0 matches with strict language filter, fallback to all languages so user doesn't hit a dead end
    if (filteredResults.length === 0 && targetLangCode && rawResults.length > 0) {
      broadenedSearch = true;
      fallbackNote = `No exact titles found in ${getLanguageDisplayName(targetLangCode)}. Showing matches from other languages.`;
      filteredResults = rawResults.filter((r) => r.id && r.title);
    }

    const mappedMovies = filteredResults.map((r) => {
      const genreIds: number[] = Array.isArray(r.genre_ids) ? r.genre_ids : [];
      const genreNames = genreIds.map((gid) => OFFICIAL_TMDB_GENRES[gid] || 'Film').filter(Boolean);
      const originalLang = (r.original_language || 'en').toLowerCase();
      const langDisplayName = getLanguageDisplayName(originalLang);

      return {
        id: `tmdb-${r.id}`,
        tmdbId: r.id,
        title: r.title,
        originalTitle: r.original_title || r.title,
        originalLanguage: originalLang,
        language: langDisplayName,
        year: r.release_date ? parseInt(r.release_date.slice(0, 4), 10) || null : null,
        releaseDate: r.release_date || '',
        rating: typeof r.vote_average === 'number' ? Math.round(r.vote_average * 10) / 10 : 0,
        voteCount: r.vote_count || 0,
        overview: r.overview || 'No synopsis available.',
        posterPath: r.poster_path || null,
        posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
        backdropPath: r.backdrop_path || null,
        backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null,
        genres: genreNames,
        genre_ids: genreIds,
      };
    });

    return NextResponse.json({
      movies: mappedMovies,
      results: mappedMovies,
      broadenedSearch,
      fallbackNote,
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || mappedMovies.length,
      appliedFilters: {
        language: targetLangCode ? getLanguageDisplayName(targetLangCode) : 'All Languages',
        languageCode: targetLangCode || null,
        genre: targetGenreId ? OFFICIAL_TMDB_GENRES[targetGenreId] : 'All Genres',
        year: targetYear || null,
      },
    });
  } catch (err: any) {
    console.error('Server error in /api/search-movies:', err?.message || err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while searching movies.' },
      { status: 500 }
    );
  }
}
