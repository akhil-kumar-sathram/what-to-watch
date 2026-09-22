import { NextResponse } from 'next/server';
import {
  toTmdbLanguageCode,
  getLanguageDisplayName,
  matchesLanguageFilter,
  isIndianLanguage,
  INDIAN_LANG_PIPE,
} from '../../../src/utils/languages';
import { OFFICIAL_TMDB_GENRES, normalizeGenreIds } from '../../../src/utils/tmdbGenres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';

// Genre ID mapping for the 18 official TMDB genres
const GENRE_ID_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  scifi: 878,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

// Intelligently related genres for Level 3 relaxation
const RELATED_GENRES: Record<number, number[]> = {
  28: [12, 53, 80], // Action -> Adventure, Thriller, Crime
  12: [28, 14, 10751], // Adventure -> Action, Fantasy, Family
  16: [10751, 14, 35], // Animation -> Family, Fantasy, Comedy
  35: [10749, 18, 10751], // Comedy -> Romance, Drama, Family
  80: [53, 9648, 18], // Crime -> Thriller, Mystery, Drama
  99: [36, 18], // Documentary -> History, Drama
  18: [10749, 36, 80], // Drama -> Romance, History, Crime
  10751: [16, 35, 14], // Family -> Animation, Comedy, Fantasy
  14: [12, 16, 878], // Fantasy -> Adventure, Animation, Sci-Fi
  36: [10752, 18], // History -> War, Drama
  27: [53, 9648], // Horror -> Thriller, Mystery
  10402: [18, 10749, 35], // Music -> Drama, Romance, Comedy
  9648: [53, 80, 18], // Mystery -> Thriller, Crime, Drama
  10749: [18, 35], // Romance -> Drama, Comedy
  878: [14, 28, 12], // Sci-Fi -> Fantasy, Action, Adventure
  53: [80, 9648, 28], // Thriller -> Crime, Mystery, Action
  10752: [36, 28, 18], // War -> History, Action, Drama
  37: [28, 18, 12], // Western -> Action, Drama, Adventure
};

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
    const genreParam = (searchParams.get('genre') || 'all').trim().toLowerCase();
    const languageParam = searchParams.get('language') || searchParams.get('lang');
    const startPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const targetCount = Math.min(100, Math.max(30, parseInt(searchParams.get('limit') || '50', 10)));

    const tmdbKey = process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
    if (!tmdbKey) {
      return NextResponse.json(
        { error: 'Movie catalog service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    // Resolve TMDB Genre ID (null if 'all')
    let genreId: number | null = null;
    let genreName = 'All Genres';
    if (genreParam && genreParam !== 'all' && genreParam !== 'all genres') {
      if (GENRE_ID_MAP[genreParam]) {
        genreId = GENRE_ID_MAP[genreParam];
      } else if (!isNaN(parseInt(genreParam, 10))) {
        genreId = parseInt(genreParam, 10);
      } else {
        const mapped = normalizeGenreIds([genreParam]);
        if (mapped.length > 0) genreId = mapped[0];
      }
      if (genreId && OFFICIAL_TMDB_GENRES[genreId]) {
        genreName = OFFICIAL_TMDB_GENRES[genreId];
      }
    }

    // Resolve Language Code (null if 'all')
    const targetLangCode = toTmdbLanguageCode(languageParam);
    const userLanguageDisplay = targetLangCode ? getLanguageDisplayName(targetLangCode) : 'All Languages';

    const validMovies: any[] = [];
    const seenIds = new Set<number>();
    let fallbackLevel = 1;
    let fallbackMessage: string | null = null;
    let totalTmdbHits = 0;

    // Helper to process and append movies
    const ingestResults = (
      results: any[],
      requiredGenreId: number | null,
      allowedLangCode: string | null,
      skipLanguageValidation = false
    ) => {
      for (const r of results) {
        if (!r.id || seenIds.has(r.id)) continue;

        // 1. MUST have an authentic TMDB poster path
        if (
          !r.poster_path ||
          typeof r.poster_path !== 'string' ||
          !r.poster_path.startsWith('/') ||
          r.poster_path.length < 5
        ) {
          continue;
        }

        const genreIds: number[] = Array.isArray(r.genre_ids) ? r.genre_ids : [];

        // 2. Genre verification (if a specific genre was requested and we are enforcing it)
        if (requiredGenreId !== null && !genreIds.includes(requiredGenreId)) {
          continue;
        }

        // 3. Language verification (unless explicitly bypassed during broader fallback)
        if (!skipLanguageValidation && allowedLangCode && !matchesLanguageFilter(r.original_language, allowedLangCode)) {
          continue;
        }

        seenIds.add(r.id);

        const genreNames = genreIds.map((gid) => OFFICIAL_TMDB_GENRES[gid] || 'Film').filter(Boolean);
        const origLang = (r.original_language || 'en').toLowerCase();
        const langDisplay = getLanguageDisplayName(origLang);

        validMovies.push({
          id: `tmdb-${r.id}`,
          tmdbId: r.id,
          title: r.title || 'Untitled',
          originalTitle: r.original_title || r.title,
          originalLanguage: origLang,
          language: langDisplay,
          year: r.release_date ? parseInt(r.release_date.slice(0, 4), 10) || null : null,
          releaseDate: r.release_date || '',
          rating: typeof r.vote_average === 'number' ? Math.round(r.vote_average * 10) / 10 : 0,
          voteCount: r.vote_count || 0,
          overview: r.overview || 'No synopsis available.',
          posterPath: r.poster_path,
          posterUrl: `https://image.tmdb.org/t/p/w500${r.poster_path}`,
          backdropPath: r.backdrop_path || null,
          backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : null,
          genres: genreNames,
          genre_ids: genreIds,
        });

        if (validMovies.length >= targetCount) break;
      }
    };

    // Helper to query TMDB discover
    const queryDiscover = async (
      page: number,
      withGenreId: number | null,
      withLang: string | null,
      customParams: Record<string, string> = {}
    ): Promise<{ results: any[]; total_pages: number; total_results: number }> => {
      const params = new URLSearchParams({
        api_key: tmdbKey,
        language: 'en-US',
        include_adult: 'false',
        include_video: 'false',
        sort_by: 'popularity.desc',
        page: String(page),
        'vote_count.gte': withLang ? '2' : '15',
        ...customParams,
      });

      if (withGenreId !== null) {
        params.set('with_genres', String(withGenreId));
      }
      if (withLang) {
        params.set('with_original_language', withLang);
      }

      const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    };

    // =========================================================================
    // LEVEL 1: EXACT MATCH (Page 1)
    // =========================================================================
    try {
      const p1 = await queryDiscover(startPage, genreId, targetLangCode);
      totalTmdbHits = p1.total_results || 0;
      if (Array.isArray(p1.results)) {
        ingestResults(p1.results, genreId, targetLangCode);
      }
    } catch (err: any) {
      console.warn(`Level 1 discover error:`, err?.message || err);
    }

    // =========================================================================
    // LEVEL 2: MORE PAGES OF THE SAME FILTER (Page 2, 3, 4, 5...)
    // Continue until 30+ valid movies or pages exhausted
    // =========================================================================
    if (validMovies.length < targetCount) {
      fallbackLevel = 2;
      for (let p = startPage + 1; p <= startPage + 6; p++) {
        if (validMovies.length >= targetCount) break;
        try {
          const nextData = await queryDiscover(p, genreId, targetLangCode);
          if (Array.isArray(nextData.results) && nextData.results.length > 0) {
            ingestResults(nextData.results, genreId, targetLangCode);
          } else {
            break;
          }
          if (p >= (nextData.total_pages || 1)) break;
        } catch (err: any) {
          console.warn(`Level 2 discover page ${p} error:`, err?.message || err);
          break;
        }
      }
    }

    // =========================================================================
    // LEVEL 3: SAME LANGUAGE, RELATED GENRES (Keep user's language!)
    // If still insufficient (< 20 movies) and a specific language was selected
    // =========================================================================
    if (validMovies.length < 25 && targetLangCode && genreId !== null) {
      fallbackLevel = 3;
      fallbackMessage = `Showing more popular ${userLanguageDisplay} films because there are limited ${genreName} titles.`;
      
      const relatedList = RELATED_GENRES[genreId] || [];
      for (const relId of relatedList) {
        if (validMovies.length >= targetCount) break;
        try {
          const relData = await queryDiscover(1, relId, targetLangCode);
          if (Array.isArray(relData.results)) {
            ingestResults(relData.results, null, targetLangCode); // accept related genre
          }
        } catch (err: any) {
          console.warn(`Level 3 related genre ${relId} error:`, err?.message || err);
        }
      }

      // If still < 20, fetch general top films in the user's language
      if (validMovies.length < 20) {
        try {
          const allGenresInLang = await queryDiscover(1, null, targetLangCode);
          if (Array.isArray(allGenresInLang.results)) {
            ingestResults(allGenresInLang.results, null, targetLangCode);
          }
        } catch (err: any) {
          console.warn(`Level 3 general language error:`, err?.message || err);
        }
      }
    }

    // =========================================================================
    // LEVEL 4: SAME GENRE, OTHER INDIAN LANGUAGES (If Indian language selected)
    // If < 20 movies and selected language is an Indian language
    // =========================================================================
    if (validMovies.length < 20 && isIndianLanguage(languageParam) && genreId !== null) {
      fallbackLevel = 4;
      fallbackMessage = `Showing more ${genreName} films from other Indian languages because there are limited ${userLanguageDisplay} matches.`;
      
      for (let p = 1; p <= 3; p++) {
        if (validMovies.length >= targetCount) break;
        try {
          const indianData = await queryDiscover(p, genreId, INDIAN_LANG_PIPE);
          if (Array.isArray(indianData.results)) {
            ingestResults(indianData.results, genreId, INDIAN_LANG_PIPE);
          }
          if (p >= (indianData.total_pages || 1)) break;
        } catch (err: any) {
          console.warn(`Level 4 Indian discover page ${p} error:`, err?.message || err);
          break;
        }
      }
    }

    // =========================================================================
    // LEVEL 5: SAME GENRE, ANY LANGUAGE (Final broad fallback)
    // If still < 20 movies, search the same genre across all languages
    // =========================================================================
    if (validMovies.length < 20 && genreId !== null) {
      fallbackLevel = 5;
      fallbackMessage = `Showing more ${genreName} films across all languages because there are limited matches.`;

      for (let p = 1; p <= 3; p++) {
        if (validMovies.length >= targetCount) break;
        try {
          const globalGenreData = await queryDiscover(p, genreId, null);
          if (Array.isArray(globalGenreData.results)) {
            ingestResults(globalGenreData.results, genreId, null, true);
          }
          if (p >= (globalGenreData.total_pages || 1)) break;
        } catch (err: any) {
          console.warn(`Level 5 global genre discover page ${p} error:`, err?.message || err);
          break;
        }
      }
    }

    return NextResponse.json({
      movies: validMovies,
      genreName,
      genreId,
      language: userLanguageDisplay,
      languageCode: targetLangCode,
      count: validMovies.length,
      fallbackLevel,
      fallbackMessage: validMovies.length > 0 && fallbackLevel >= 3 ? fallbackMessage : null,
      totalTmdbResults: totalTmdbHits,
    });
  } catch (err: any) {
    console.error('Server error in /api/genre-movies:', err?.message || err);
    return NextResponse.json(
      { error: 'Movie service temporarily unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
