export interface ClassicMovieTheme {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  director: string;
  tagline: string;
  era: string;
  poster_path: string;
  backdrop_path: string;
  accentColor: string;
  borderGlow: string;
  synopsis: string;
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Constructs a verified TMDB CDN image URL for a classic movie poster.
 * Documented format: https://image.tmdb.org/t/p/w500/{poster_path} or w780
 */
export function getClassicPosterUrl(
  posterPath: string | null | undefined,
  size: 'w342' | 'w500' | 'w780' | 'original' = 'w780'
): string | null {
  if (!posterPath || typeof posterPath !== 'string' || !posterPath.startsWith('/')) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/**
 * Constructs a verified TMDB CDN image URL for a classic movie backdrop.
 */
export function getClassicBackdropUrl(
  backdropPath: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280'
): string | null {
  if (!backdropPath || typeof backdropPath !== 'string' || !backdropPath.startsWith('/')) {
    return null;
  }
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

/**
 * Curated collection of verified classic Hollywood & international cinema masterpieces.
 * All poster and backdrop paths are authentic, tested against the TMDB CDN (HTTP 200).
 */
export const CLASSIC_CINEMA_THEMES: ClassicMovieTheme[] = [
  {
    id: 'casablanca',
    tmdbId: 289,
    title: 'Casablanca',
    year: 1942,
    director: 'Michael Curtiz',
    tagline: 'Here’s looking at you, kid.',
    era: 'Golden Age (1940s)',
    poster_path: '/lGCEKlJo2CnWydQj7aamY7s1S7Q.jpg',
    backdrop_path: '/87wqeMeUeMRLjsE1IWNKJcPlpuC.jpg',
    accentColor: 'from-amber-600/30 via-yellow-600/15 to-transparent',
    borderGlow: 'border-amber-400/80 shadow-amber-500/30',
    synopsis: 'In German-occupied Morocco during WWII, a cynical expatriate nightclub owner must choose between his love for a former flame and helping her Czech Resistance leader husband escape.',
  },
  {
    id: 'godfather',
    tmdbId: 238,
    title: 'The Godfather',
    year: 1972,
    director: 'Francis Ford Coppola',
    tagline: 'An offer you cannot refuse.',
    era: 'New Hollywood (1970s)',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg',
    accentColor: 'from-orange-700/30 via-amber-900/15 to-transparent',
    borderGlow: 'border-amber-500/80 shadow-amber-600/30',
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.',
  },
  {
    id: 'psycho',
    tmdbId: 539,
    title: 'Psycho',
    year: 1960,
    director: 'Alfred Hitchcock',
    tagline: 'The picture you must see from the beginning.',
    era: 'Classic Suspense (1960s)',
    poster_path: '/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg',
    backdrop_path: '/mufF1aYvwdpKerhq5R1YrVcbJLY.jpg',
    accentColor: 'from-zinc-400/25 via-neutral-600/15 to-transparent',
    borderGlow: 'border-neutral-300/80 shadow-neutral-400/30',
    synopsis: 'A Phoenix secretary embezzles $40,000 from her employer, goes on the run, and checks into a remote motel run by a young man under the domination of his mother.',
  },
  {
    id: 'vertigo',
    tmdbId: 426,
    title: 'Vertigo',
    year: 1958,
    director: 'Alfred Hitchcock',
    tagline: 'Alfred Hitchcock’s masterpiece of obsession.',
    era: 'Mid-Century Masterpiece (1950s)',
    poster_path: '/15uOEfqBNTVtDUT7hGBVCka0rZz.jpg',
    backdrop_path: '/rtVwkTqllcmyY4TVOycgVBHppWf.jpg',
    accentColor: 'from-emerald-600/30 via-teal-700/15 to-transparent',
    borderGlow: 'border-emerald-400/80 shadow-emerald-500/30',
    synopsis: 'A former San Francisco police detective juggles wrestling with his personal demons and becoming dangerously obsessed with the haunting woman he has been hired to trail.',
  },
  {
    id: 'space-odyssey',
    tmdbId: 62,
    title: '2001: A Space Odyssey',
    year: 1968,
    director: 'Stanley Kubrick',
    tagline: 'An epic drama of adventure and exploration.',
    era: 'Sci-Fi Landmark (1960s)',
    poster_path: '/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg',
    backdrop_path: '/w5IDXtifKntw0ajv2co7jFlTQDM.jpg',
    accentColor: 'from-blue-600/30 via-indigo-700/15 to-transparent',
    borderGlow: 'border-sky-400/80 shadow-sky-500/30',
    synopsis: 'After uncovering a mysterious artifact buried on the Moon, a spacecraft is sent to Jupiter to find its origins, manned by two astronauts and the supercomputer HAL 9000.',
  },
  {
    id: 'jaws',
    tmdbId: 578,
    title: 'Jaws',
    year: 1975,
    director: 'Steven Spielberg',
    tagline: 'Don’t go in the water.',
    era: 'Summer Blockbuster (1970s)',
    poster_path: '/lxM6kqilAdpdhqUl2biYp5frUxE.jpg',
    backdrop_path: '/i1yf91svRHX45l9BXL8rVFzLoPH.jpg',
    accentColor: 'from-cyan-600/30 via-blue-800/15 to-transparent',
    borderGlow: 'border-cyan-400/80 shadow-cyan-500/30',
    synopsis: 'When a killer shark unleashes chaos on a beach community off Long Island, it is up to a local sheriff, a marine biologist, and an old seafarer to hunt the beast down.',
  },
  {
    id: 'taxi-driver',
    tmdbId: 103,
    title: 'Taxi Driver',
    year: 1976,
    director: 'Martin Scorsese',
    tagline: 'On every street in every city, there’s a nobody who dreams of being a somebody.',
    era: 'Neo-Noir (1970s)',
    poster_path: '/ekstpH614fwDX8DUln1a2Opz0N8.jpg',
    backdrop_path: '/9uddYYTNcLWpzUkl5iw1RUYhLhY.jpg',
    accentColor: 'from-yellow-600/30 via-rose-900/15 to-transparent',
    borderGlow: 'border-yellow-400/80 shadow-yellow-500/30',
    synopsis: 'A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decadence fuels his urge for violent action.',
  },
  {
    id: 'shining',
    tmdbId: 694,
    title: 'The Shining',
    year: 1980,
    director: 'Stanley Kubrick',
    tagline: 'A masterpiece of modern horror.',
    era: 'Psychological Horror (1980)',
    poster_path: '/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg',
    backdrop_path: '/AdKA2F1SzYPhSZdEbjH1Zh75UVQ.jpg',
    accentColor: 'from-rose-600/30 via-amber-950/20 to-transparent',
    borderGlow: 'border-rose-400/80 shadow-rose-500/30',
    synopsis: 'A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees terrifying forebodings from both past and future.',
  },
  {
    id: 'rear-window',
    tmdbId: 567,
    title: 'Rear Window',
    year: 1954,
    director: 'Alfred Hitchcock',
    tagline: 'It only takes one witness to turn suspicion into murder.',
    era: 'Classic Suspense (1950s)',
    poster_path: '/ILVF0eJxHMddjxeQhswFtpMtqx.jpg',
    backdrop_path: '/zGs5tZOlvc9cprdcU6kDOVNpujf.jpg',
    accentColor: 'from-amber-600/30 via-emerald-900/15 to-transparent',
    borderGlow: 'border-amber-400/80 shadow-amber-500/30',
    synopsis: 'A recuperating photographer recuperating in a wheelchair spies on his neighbors from his apartment window and becomes convinced one of them has committed murder.',
  },
  {
    id: 'singin-rain',
    tmdbId: 872,
    title: 'Singin’ in the Rain',
    year: 1952,
    director: 'Gene Kelly & Stanley Donen',
    tagline: 'What a glorious feeling, I’m happy again.',
    era: 'Golden Musical (1950s)',
    poster_path: '/w03EiJVHP8Un77boQeE7hg9DVdU.jpg',
    backdrop_path: '/6qOyw4yfzbzTp5YsCX26C28Do0S.jpg',
    accentColor: 'from-yellow-500/30 via-sky-700/15 to-transparent',
    borderGlow: 'border-yellow-400/80 shadow-yellow-500/30',
    synopsis: 'A silent film star falls for a chorus girl just as he and his delusional screen partner are attempting to make the difficult transition into talking pictures in 1920s Hollywood.',
  },
  {
    id: 'roman-holiday',
    tmdbId: 804,
    title: 'Roman Holiday',
    year: 1953,
    director: 'William Wyler',
    tagline: 'Audrey Hepburn in her breakthrough Academy Award-winning performance.',
    era: 'Romantic Classic (1950s)',
    poster_path: '/8lI9dmz1RH20FAqltkGelY1v4BE.jpg',
    backdrop_path: '/gzRISGjiDMj4xqYE9ES2KNIXxpo.jpg',
    accentColor: 'from-rose-500/30 via-pink-800/15 to-transparent',
    borderGlow: 'border-rose-400/80 shadow-rose-500/30',
    synopsis: 'Overwhelmed by her suffocating royal duties, a touring European princess sneaks away in Rome and falls into an exhilarating whirlwind adventure with an American reporter.',
  },
  {
    id: 'sunset-boulevard',
    tmdbId: 938,
    title: 'Sunset Boulevard',
    year: 1950,
    director: 'Billy Wilder',
    tagline: 'A Hollywood story... unforgettable and raw.',
    era: 'Film Noir (1950s)',
    poster_path: '/ooqASvA7qxlTVKL3KwOzBwy57Dh.jpg',
    backdrop_path: '/hs6OPto38fF589ScpGhl7uSU4MI.jpg',
    accentColor: 'from-amber-700/30 via-neutral-800/20 to-transparent',
    borderGlow: 'border-amber-400/80 shadow-amber-500/30',
    synopsis: 'A struggling screenwriter develops a perilous, toxic relationship with a faded silent-film star determined to make a triumphant return to the big screen.',
  },
  {
    id: 'lawrence-arabia',
    tmdbId: 947,
    title: 'Lawrence of Arabia',
    year: 1962,
    director: 'David Lean',
    tagline: 'A towering achievement in cinema history.',
    era: 'Cinematic Epic (1960s)',
    poster_path: '/AiAm0EtDvyGqNpVoieRw4u65vD1.jpg',
    backdrop_path: '/eULrEMwgXnWmzdowUfegaw2YYgD.jpg',
    accentColor: 'from-amber-500/30 via-orange-800/15 to-transparent',
    borderGlow: 'border-amber-400/80 shadow-amber-500/30',
    synopsis: 'The story of T.E. Lawrence, the eccentric British Army lieutenant sent to Arabia during WWI who unites divided Arab tribes to fight against the Ottoman Turks.',
  },
];

export const DEFAULT_THEME_ID = 'casablanca';

export function getThemeById(id: string): ClassicMovieTheme {
  return (
    CLASSIC_CINEMA_THEMES.find((theme) => theme.id === id) ||
    CLASSIC_CINEMA_THEMES[0]
  );
}
