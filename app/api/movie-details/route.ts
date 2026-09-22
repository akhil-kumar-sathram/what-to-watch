import { NextResponse } from 'next/server';
import { getLanguageDisplayName } from '../../../src/utils/languages';
import { OFFICIAL_TMDB_GENRES } from '../../../src/utils/tmdbGenres';

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
    const tmdbIdParam = searchParams.get('id') || searchParams.get('tmdbId');

    if (!tmdbIdParam) {
      return NextResponse.json(
        { error: 'Movie ID (tmdbId) is required.' },
        { status: 400 }
      );
    }

    const tmdbId = parseInt(tmdbIdParam.replace(/\D/g, ''), 10);
    if (!tmdbId || isNaN(tmdbId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID.' },
        { status: 400 }
      );
    }

    const tmdbKey = process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbKey}&append_to_response=credits,videos,images&language=en-US`;

    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Movie details could not be retrieved.' },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const data = await res.json();

    // Extract Director
    const crew: any[] = data.credits?.crew || [];
    const director = crew.find((c) => c.job === 'Director')?.name || 'Renowned Filmmaker';

    // Extract Cast
    const castList: any[] = data.credits?.cast || [];
    const cast = castList.slice(0, 8).map((c) => c.name);

    // Extract Official YouTube Trailer
    const videos: any[] = data.videos?.results || [];
    const trailer = videos.find(
      (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    ) || videos.find((v) => v.site === 'YouTube');
    const trailerUrl = trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

    // Genres
    const genreNames = Array.isArray(data.genres)
      ? data.genres.map((g: any) => g.name || OFFICIAL_TMDB_GENRES[g.id] || 'Film')
      : [];
    const genreIds = Array.isArray(data.genres)
      ? data.genres.map((g: any) => g.id)
      : [];

    const originalLang = (data.original_language || 'en').toLowerCase();
    const langDisplayName = getLanguageDisplayName(originalLang);

    const movie = {
      id: `tmdb-${data.id}`,
      tmdbId: data.id,
      title: data.title,
      originalTitle: data.original_title || data.title,
      originalLanguage: originalLang,
      language: langDisplayName,
      year: data.release_date ? parseInt(data.release_date.slice(0, 4), 10) || null : null,
      releaseDate: data.release_date || '',
      runtime: data.runtime || 0,
      rating: typeof data.vote_average === 'number' ? Math.round(data.vote_average * 10) / 10 : 0,
      voteCount: data.vote_count || 0,
      tagline: data.tagline || '',
      synopsis: data.overview || '',
      overview: data.overview || '',
      director,
      cast,
      genres: genreNames,
      genre_ids: genreIds,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      posterPath: data.poster_path || null,
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      backdropPath: data.backdrop_path || null,
      trailerUrl,
    };

    return NextResponse.json({ movie });
  } catch (err: any) {
    console.error('Server error in /api/movie-details:', err?.message || err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching movie details.' },
      { status: 500 }
    );
  }
}
