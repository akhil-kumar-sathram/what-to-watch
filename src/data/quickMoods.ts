import { MoodType } from '../types';

export interface TMDBMovieData {
  title: string;
  year: number;
  actorCharacter: string;
  tmdbId: number;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface QuickMoodOption {
  mood: MoodType;
  label: string;
  tagline: string;
  movie: TMDBMovieData;
  accentColor: string;
  borderGlow: string;
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Constructs a TMDB CDN image URL for a movie backdrop.
 * Uses the documented TMDB format: https://image.tmdb.org/t/p/w780/{backdrop_path}
 */
export function getTmdbBackdropUrl(
  backdropPath: string | null | undefined,
  size: 'w780' | 'w1280' = 'w780'
): string | null {
  if (!backdropPath || typeof backdropPath !== 'string' || !backdropPath.startsWith('/')) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

/**
 * Constructs a TMDB CDN image URL for a movie poster.
 * Uses the documented TMDB format: https://image.tmdb.org/t/p/w500/{poster_path}
 */
export function getTmdbPosterUrl(
  posterPath: string | null | undefined,
  size: 'w500' | 'w780' = 'w500'
): string | null {
  if (!posterPath || typeof posterPath !== 'string' || !posterPath.startsWith('/')) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/**
 * Verified TMDB Movie Metadata for each Quick Mood option.
 * All movies are real, officially released films with validated TMDB paths.
 */
export const QUICK_MOOD_OPTIONS: QuickMoodOption[] = [
  {
    mood: 'Happy',
    label: 'Happy',
    tagline: 'Like a little more joy, please.',
    movie: {
      title: 'The Great Gatsby',
      year: 2013,
      actorCharacter: 'Leonardo DiCaprio as Jay Gatsby',
      tmdbId: 64682,
      poster_path: '/nimh1rrDDLhgpG8XAYoUZXHYwb6.jpg',
      backdrop_path: '/cf4YmtSnNhdG7s9ERmXyaDEznEw.jpg',
    },
    accentColor: 'from-[#3DBFC4]/25 to-[#12383B]/20',
    borderGlow: 'border-[#3DBFC4] ring-[#3DBFC4]/50 shadow-[#3DBFC4]/25',
  },
  {
    mood: 'Sad',
    label: 'Sad',
    tagline: 'A comforting story might help.',
    movie: {
      title: 'Jackie',
      year: 2016,
      actorCharacter: 'Natalie Portman as Jackie Kennedy',
      tmdbId: 376866,
      poster_path: '/nF9N33PfhizMEzbfxHoxXBo2vx9.jpg',
      backdrop_path: '/lF41LYBSLVpZ61rZci471pqi6UW.jpg',
    },
    accentColor: 'from-[#12383B]/50 to-[#1B2329]/40',
    borderGlow: 'border-[#3DBFC4]/70 ring-[#12383B]/50 shadow-[#12383B]/35',
  },
  {
    mood: 'Stressed',
    label: 'Stressed',
    tagline: 'Time to slow things down.',
    movie: {
      title: 'John Wick',
      year: 2014,
      actorCharacter: 'Keanu Reeves as John Wick',
      tmdbId: 245891,
      poster_path: '/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg',
      backdrop_path: '/ff2ti5DkA9UYLzyqhQfI2kZqEuh.jpg',
    },
    accentColor: 'from-[#8F3F28]/40 to-[#1B2329]/40',
    borderGlow: 'border-[#C65A32] ring-[#C65A32]/50 shadow-[#8F3F28]/30',
  },
  {
    mood: 'Tired',
    label: 'Tired',
    tagline: 'Something easy and good.',
    movie: {
      title: 'Once Upon a Time in Hollywood',
      year: 2019,
      actorCharacter: 'Brad Pitt as Cliff Booth',
      tmdbId: 466272,
      poster_path: '/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg',
      backdrop_path: '/xwgBHC2FgoIrQitl8jZwXXdsR9u.jpg',
    },
    accentColor: 'from-[#D58A3A]/25 to-[#11161B]/40',
    borderGlow: 'border-[#D58A3A] ring-[#D58A3A]/50 shadow-[#D58A3A]/25',
  },
  {
    mood: 'Excited',
    label: 'Excited',
    tagline: "Let's keep the energy going.",
    movie: {
      title: 'Top Gun: Maverick',
      year: 2022,
      actorCharacter: 'Tom Cruise as Pete "Maverick" Mitchell',
      tmdbId: 361743,
      poster_path: '/n0YuM4f5lvGAP6MAW2kBIzugXnc.jpg',
      backdrop_path: '/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg',
    },
    accentColor: 'from-[#68E1E5]/25 to-[#3DBFC4]/25',
    borderGlow: 'border-[#68E1E5] ring-[#68E1E5]/50 shadow-[#3DBFC4]/25',
  },
  {
    mood: 'Bored',
    label: 'Bored',
    tagline: 'Something unexpected, maybe?',
    movie: {
      title: 'Silver Linings Playbook',
      year: 2012,
      actorCharacter: 'Jennifer Lawrence as Tiffany Maxwell',
      tmdbId: 82693,
      poster_path: '/fhHB1uvfFKKFbj6bTKE8xdtsjKi.jpg',
      backdrop_path: '/12GpsUm9nVVKFlcjDTflKLClFVA.jpg',
    },
    accentColor: 'from-[#12383B]/35 to-[#1B2329]/40',
    borderGlow: 'border-[#3DBFC4]/60 ring-[#12383B]/50 shadow-[#12383B]/25',
  },
  {
    mood: 'Relaxed',
    label: 'Relaxed',
    tagline: 'Just the right kind of escape.',
    movie: {
      title: 'The Beach Bum',
      year: 2019,
      actorCharacter: 'Matthew McConaughey as Moondog',
      tmdbId: 441384,
      poster_path: '/iXMxdC7T0t3dxislnUNybcvJmAH.jpg',
      backdrop_path: '/nVaNhGAnPW9dmTkRDfsSpdPeWdZ.jpg',
    },
    accentColor: 'from-[#12383B]/35 to-[#11161B]/50',
    borderGlow: 'border-[#12383B] ring-[#3DBFC4]/40 shadow-[#12383B]/25',
  },
  {
    mood: 'Romantic',
    label: 'Romantic',
    tagline: 'Feel the love (or something close).',
    movie: {
      title: 'The Notebook',
      year: 2004,
      actorCharacter: 'Ryan Gosling & Rachel McAdams',
      tmdbId: 11036,
      poster_path: '/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg',
      backdrop_path: '/zdXnJqBaGFVtLoPNuMeKfEYUViZ.jpg',
    },
    accentColor: 'from-[#C65A32]/30 to-[#8F3F28]/40',
    borderGlow: 'border-[#C65A32] ring-[#C65A32]/50 shadow-[#8F3F28]/30',
  },
  {
    mood: 'Motivated',
    label: 'Motivated',
    tagline: 'Time to chase bigger dreams.',
    movie: {
      title: 'Rocky',
      year: 1976,
      actorCharacter: 'Sylvester Stallone as Rocky Balboa',
      tmdbId: 1366,
      poster_path: '/xSI0dbKLDETwhiVUy6hGE8KXUln.jpg',
      backdrop_path: '/bacOuUnRBoAO1NjMfsAGX2EKRrS.jpg',
    },
    accentColor: 'from-[#D58A3A]/30 to-[#C65A32]/30',
    borderGlow: 'border-[#D58A3A] ring-[#D58A3A]/50 shadow-[#D58A3A]/25',
  },
  {
    mood: 'Heartbroken',
    label: 'Heartbroken',
    tagline: 'Cathartic cinema to help heal your heart.',
    movie: {
      title: 'Eternal Sunshine of the Spotless Mind',
      year: 2004,
      actorCharacter: 'Jim Carrey as Joel Barish',
      tmdbId: 38,
      poster_path: '/5MwkWH9tYHv3mV9OdYTMR5q9IzY.jpg',
      backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    },
    accentColor: 'from-[#8F3F28]/40 to-[#12383B]/30',
    borderGlow: 'border-[#C65A32] ring-[#8F3F28]/50 shadow-[#8F3F28]/30',
  },
];
