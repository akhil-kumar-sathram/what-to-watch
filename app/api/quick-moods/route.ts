import { NextResponse } from 'next/server';
import { QUICK_MOOD_OPTIONS, QuickMoodOption } from '@/src/data/quickMoods';

export async function GET() {
  const DEFAULT_TMDB_API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
  const tmdbKey = process.env.TMDB_API_KEY || DEFAULT_TMDB_API_KEY;

  // If no TMDB API key is available, return the verified TMDB movie dataset
  if (!tmdbKey) {
    return NextResponse.json({
      success: true,
      source: 'tmdb_verified_curated',
      data: QUICK_MOOD_OPTIONS,
    });
  }

  // If TMDB_API_KEY is configured on the server, optionally fetch live data from TMDB
  try {
    const updatedOptions: QuickMoodOption[] = await Promise.all(
      QUICK_MOOD_OPTIONS.map(async (option) => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${option.movie.tmdbId}?api_key=${tmdbKey}&language=en-US`,
            { next: { revalidate: 86400 } }
          );

          if (!res.ok) {
            return option;
          }

          const liveData = await res.json();
          return {
            ...option,
            movie: {
              ...option.movie,
              title: liveData.title || option.movie.title,
              year: liveData.release_date
                ? parseInt(liveData.release_date.slice(0, 4), 10)
                : option.movie.year,
              poster_path: liveData.poster_path || option.movie.poster_path,
              backdrop_path: liveData.backdrop_path || option.movie.backdrop_path,
            },
          };
        } catch {
          return option;
        }
      })
    );

    return NextResponse.json({
      success: true,
      source: 'tmdb_live',
      data: updatedOptions,
    });
  } catch {
    return NextResponse.json({
      success: true,
      source: 'tmdb_fallback',
      data: QUICK_MOOD_OPTIONS,
    });
  }
}
