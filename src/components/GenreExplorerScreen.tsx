'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Play, 
  Star, 
  ArrowLeft, 
  Bookmark, 
  Heart, 
  Eye, 
  Flame, 
  Smile, 
  HeartHandshake, 
  Ghost, 
  Zap, 
  Compass, 
  Search,
  Clapperboard,
  Shield,
  Globe,
  Film,
  Music2,
  Tv,
  Sword,
  BookOpen,
  Users,
  RefreshCw,
  Loader2,
  ChevronDown,
  Info
} from 'lucide-react';
import { Movie } from '../types';
import { MoviePosterImage } from './MoviePosterImage';

export interface GenreDef {
  id: string;
  name: string;
  tmdbId: number;
  tagline: string;
  description: string;
  moodAffinity: string;
  color: string;
  accentBorder: string;
  iconName: string;
}

export const ALL_GENRES_OPTION: GenreDef = {
  id: 'all',
  name: 'All Genres',
  tmdbId: 0,
  tagline: 'Cinema without boundaries across all categories',
  description: 'Explore the full spectrum of world cinema across all genres and storytelling traditions.',
  moodAffinity: 'Open & Eclectic',
  color: 'from-amber-600/30 via-rose-600/20 to-purple-800/20',
  accentBorder: 'hover:border-amber-400/50',
  iconName: 'Film',
};

// All 18 Official TMDB Genres
export const GENRE_CATALOG: GenreDef[] = [
  {
    id: 'action',
    name: 'Action',
    tmdbId: 28,
    tagline: 'High-octane adrenaline & pulse-pounding stakes',
    description: 'Electrifying stunts, triumphant heroes, and immersive cinematic momentum.',
    moodAffinity: 'Motivated & Energized',
    color: 'from-amber-600/30 to-orange-700/20',
    accentBorder: 'hover:border-amber-500/50',
    iconName: 'Zap',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    tmdbId: 12,
    tagline: 'Epic expeditions, wanderlust & bold exploration',
    description: 'Grand scenic voyages that awaken the spirit of discovery and daring wonder.',
    moodAffinity: 'Restless & Craving Wonder',
    color: 'from-amber-700/30 to-emerald-800/20',
    accentBorder: 'hover:border-amber-400/50',
    iconName: 'Compass',
  },
  {
    id: 'animation',
    name: 'Animation',
    tmdbId: 16,
    tagline: 'Visual masterpieces & ageless storytelling',
    description: 'Gorgeous hand-drawn and digital artistry creating boundless emotional magic.',
    moodAffinity: 'Comforted & Inspired',
    color: 'from-pink-600/30 to-purple-800/20',
    accentBorder: 'hover:border-pink-400/50',
    iconName: 'Sparkles',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    tmdbId: 35,
    tagline: 'Pure laughter, witty satire & lighthearted warmth',
    description: 'Lift your spirits and release the day’s stress with belly-laughs and sharp humor.',
    moodAffinity: 'Tired & Needs Unwinding',
    color: 'from-yellow-500/30 to-amber-600/20',
    accentBorder: 'hover:border-yellow-500/50',
    iconName: 'Smile',
  },
  {
    id: 'crime',
    name: 'Crime',
    tmdbId: 80,
    tagline: 'Moral ambiguity, noir alleys & intricate heists',
    description: 'Compelling criminal underworlds, tense investigations, and nuanced moral codes.',
    moodAffinity: 'Grounded & Intense',
    color: 'from-slate-700/30 to-stone-900/30',
    accentBorder: 'hover:border-slate-400/50',
    iconName: 'Shield',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    tmdbId: 99,
    tagline: 'Eye-opening realities, human truths & untold histories',
    description: 'Factual revelations and breathtaking real-world accounts that expand your perspective.',
    moodAffinity: 'Curious & Inquisitive',
    color: 'from-teal-700/30 to-cyan-900/20',
    accentBorder: 'hover:border-teal-400/50',
    iconName: 'BookOpen',
  },
  {
    id: 'drama',
    name: 'Drama',
    tmdbId: 18,
    tagline: 'Profound human emotion & rich narrative depth',
    description: 'Intimate character journeys, thought-provoking dilemmas, and resonant emotional truths.',
    moodAffinity: 'Reflective & Contemplative',
    color: 'from-indigo-600/30 to-purple-700/20',
    accentBorder: 'hover:border-indigo-500/50',
    iconName: 'Clapperboard',
  },
  {
    id: 'family',
    name: 'Family',
    tmdbId: 10751,
    tagline: 'Heartwarming adventures for all generations',
    description: 'Charming tales of loyalty, laughter, and togetherness suitable for every age.',
    moodAffinity: 'Cozy & Wholesome',
    color: 'from-sky-500/30 to-blue-700/20',
    accentBorder: 'hover:border-sky-400/50',
    iconName: 'Users',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    tmdbId: 14,
    tagline: 'Mythical realms, magic & epic worldbuilding',
    description: 'Enchanting escapism that transports your consciousness far from everyday life.',
    moodAffinity: 'Escapist & Dreamy',
    color: 'from-emerald-700/30 to-teal-900/20',
    accentBorder: 'hover:border-emerald-500/50',
    iconName: 'Sparkles',
  },
  {
    id: 'history',
    name: 'History',
    tmdbId: 36,
    tagline: 'Epoch-defining events & unforgettable figures',
    description: 'Authentic historical epics detailing pivotal moments and monumental sacrifices.',
    moodAffinity: 'Grounded & Deeply Moved',
    color: 'from-amber-800/30 to-stone-900/30',
    accentBorder: 'hover:border-amber-600/50',
    iconName: 'BookOpen',
  },
  {
    id: 'horror',
    name: 'Horror',
    tmdbId: 27,
    tagline: 'Visceral chills, psychological dread & eerie thrills',
    description: 'Heart-pounding tension, sinister atmospheres, and cathartic terror.',
    moodAffinity: 'Bored & Craving a Rush',
    color: 'from-red-900/40 to-black/60',
    accentBorder: 'hover:border-red-600/50',
    iconName: 'Ghost',
  },
  {
    id: 'music',
    name: 'Music',
    tmdbId: 10402,
    tagline: 'Sonic soul, rhythmic passion & musical triumph',
    description: 'Electrifying concerts, biographical odysseys, and melodic tributes to sound.',
    moodAffinity: 'Uplifted & Melodic',
    color: 'from-fuchsia-600/30 to-purple-900/20',
    accentBorder: 'hover:border-fuchsia-400/50',
    iconName: 'Music2',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    tmdbId: 9648,
    tagline: 'Puzzling enigmas, cryptic clues & shocking secrets',
    description: 'Whodunits, labyrinthine investigations, and mind-bending discoveries.',
    moodAffinity: 'Analytical & Intrigued',
    color: 'from-violet-800/30 to-slate-900/30',
    accentBorder: 'hover:border-violet-400/50',
    iconName: 'Compass',
  },
  {
    id: 'romance',
    name: 'Romance',
    tmdbId: 10749,
    tagline: 'Passionate intimacy, serendipity & tender devotion',
    description: 'Swoon-worthy chemistry, poignant heartbreaks, and enduring romantic connections.',
    moodAffinity: 'Romantic & Vulnerable',
    color: 'from-rose-600/30 to-pink-700/20',
    accentBorder: 'hover:border-rose-500/50',
    iconName: 'HeartHandshake',
  },
  {
    id: 'scifi',
    name: 'Science Fiction',
    tmdbId: 878,
    tagline: 'Futuristic wonder, speculative technology & cosmos',
    description: 'Mind-bending concepts that stretch reality and explore humanity’s place among the stars.',
    moodAffinity: 'Curious & Imaginative',
    color: 'from-sky-600/30 to-indigo-900/20',
    accentBorder: 'hover:border-sky-400/50',
    iconName: 'Compass',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    tmdbId: 53,
    tagline: 'Edge-of-your-seat suspense & gripping twists',
    description: 'Relentless pacing, intricate psychological games, and unpredictable revelations.',
    moodAffinity: 'Curious & Alert',
    color: 'from-cyan-700/30 to-blue-900/20',
    accentBorder: 'hover:border-cyan-500/50',
    iconName: 'Flame',
  },
  {
    id: 'war',
    name: 'War',
    tmdbId: 10752,
    tagline: 'Courage, battlefield sacrifice & moral survival',
    description: 'Unflinching depictions of military conflict, brotherhood, and human resilience under fire.',
    moodAffinity: 'Grounded & Moved',
    color: 'from-stone-800/40 to-neutral-900/30',
    accentBorder: 'hover:border-stone-500/50',
    iconName: 'Sword',
  },
  {
    id: 'western',
    name: 'Western',
    tmdbId: 37,
    tagline: 'Frontier justice, rugged landscapes & lone outlaws',
    description: 'Dusty showdowns, legendary gunfighters, and the untamed expanse of the frontier.',
    moodAffinity: 'Grit & Defiance',
    color: 'from-amber-900/30 to-yellow-950/20',
    accentBorder: 'hover:border-amber-700/50',
    iconName: 'Shield',
  },
];

export const FULL_GENRE_CATALOG: GenreDef[] = [ALL_GENRES_OPTION, ...GENRE_CATALOG];

// Exact list requested by user
export const PRIMARY_LANGUAGE_OPTIONS = [
  { label: 'All Languages', value: 'all' },
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Malayalam', value: 'Malayalam' },
  { label: 'Kannada', value: 'Kannada' },
  { label: 'Bengali', value: 'Bengali' },
  { label: 'Marathi', value: 'Marathi' },
  { label: 'Punjabi', value: 'Punjabi' },
  { label: 'Gujarati', value: 'Gujarati' },
  { label: 'Urdu', value: 'Urdu' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Russian', value: 'Russian' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Turkish', value: 'Turkish' },
  { label: 'Thai', value: 'Thai' },
  { label: 'Indonesian', value: 'Indonesian' },
  { label: 'Vietnamese', value: 'Vietnamese' },
  { label: 'Any Indian Language', value: 'Any Indian Language' },
];

export const MORE_LANGUAGE_OPTIONS = [
  { label: 'Swedish', value: 'Swedish' },
  { label: 'Dutch', value: 'Dutch' },
  { label: 'Polish', value: 'Polish' },
  { label: 'Persian / Farsi', value: 'Persian' },
  { label: 'Odia', value: 'Odia' },
  { label: 'Assamese', value: 'Assamese' },
  { label: 'Danish', value: 'Danish' },
  { label: 'Norwegian', value: 'Norwegian' },
  { label: 'Finnish', value: 'Finnish' },
  { label: 'Greek', value: 'Greek' },
  { label: 'Hebrew', value: 'Hebrew' },
  { label: 'Hungarian', value: 'Hungarian' },
  { label: 'Czech', value: 'Czech' },
  { label: 'Romanian', value: 'Romanian' },
  { label: 'Ukrainian', value: 'Ukrainian' },
  { label: 'Tagalog', value: 'Tagalog' },
];

interface GenreExplorerScreenProps {
  onBack: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  onLaunchMoodWithGenre: (genreName: string) => void;
  isWatchlist: (id: string) => boolean;
  onToggleWatchlist: (movie: Movie) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (movie: Movie) => void;
  initialGenre?: string;
  initialLanguage?: string;
}

export const GenreExplorerScreen: React.FC<GenreExplorerScreenProps> = ({
  onBack,
  onSelectMovie,
  onPlayTrailer,
  onLaunchMoodWithGenre,
  isWatchlist,
  onToggleWatchlist,
  isFavorite,
  onToggleFavorite,
  initialGenre = 'all',
  initialLanguage = 'all',
}) => {
  const [selectedGenreId, setSelectedGenreId] = useState<string>(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const activeGenre = FULL_GENRE_CATALOG.find((g) => g.id === selectedGenreId) || ALL_GENRES_OPTION;

  // Fetch movies from /api/genre-movies
  const loadGenreMovies = useCallback(
    async (genreIdVal: string, lang: string, pageNum: number, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setFetchError(null);
      }

      try {
        const params = new URLSearchParams({
          genre: genreIdVal,
          language: lang,
          page: String(pageNum),
          limit: '40',
        });

        const res = await fetch(`/api/genre-movies?${params.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Movie catalog service temporarily unavailable. Please try again.`);
        }

        const data = await res.json();
        const incoming: Movie[] = Array.isArray(data.movies) ? data.movies : [];

        if (isAppend) {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = incoming.filter((m) => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
        } else {
          setMovies(incoming);
        }

        setFallbackMessage(data.fallbackMessage || null);
        setTotalResults(data.totalTmdbResults || incoming.length);
        setHasMore(incoming.length >= 30);
      } catch (err: any) {
        console.error('Error fetching genre movies:', err);
        setFetchError(err?.message || 'Movie service temporarily unavailable. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Re-fetch whenever genre or language selection changes
  useEffect(() => {
    setPage(1);
    loadGenreMovies(selectedGenreId, selectedLanguage, 1, false);
  }, [selectedGenreId, selectedLanguage, loadGenreMovies]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadGenreMovies(selectedGenreId, selectedLanguage, nextPage, true);
  };

  // Search filter across loaded movies
  const displayedMovies = searchQuery.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.language && m.language.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (Array.isArray(m.cast) && m.cast.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : movies;

  return (
    <div className="relative min-h-[calc(100vh-65px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3B1118]/60">
          <div>
            <button
              id="genre-back-btn"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#8D989A] hover:text-[#E5E8E6] transition-colors mb-3 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Mood Matcher</span>
            </button>
            <h1 className="font-cinema-serif text-3xl sm:text-4xl font-bold text-[#E5E8E6] tracking-tight">
              Explore Cinema
            </h1>
            <p className="mt-1 text-sm text-[#8D989A]">
              Browse real films from TMDB by Genre and Language with smart multi-tiered discovery.
            </p>
          </div>

          {/* Search bar inside genre */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8D989A]/60" />
            <input
              id="genre-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeGenre.name}...`}
              className="w-full rounded-xl border border-[#12383B] bg-[#11161B] py-2.5 pl-9 pr-4 text-xs text-[#E5E8E6] placeholder-[#8D989A]/50 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4]"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL FILTER ROW: GENRE AND LANGUAGE SIDE BY SIDE ON DESKTOP        */}
        {/* Both controls have equal visual importance and similar width             */}
        {/* On mobile screens, stack them vertically without overflow                 */}
        {/* ========================================================================= */}
        <div 
          id="what-to-watch-filter-row" 
          className="mt-6 rounded-2xl border border-[#12383B] bg-[#11161B]/95 p-4 sm:p-6 backdrop-blur-xl shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* GENRE SELECTOR */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="genre-select"
                className="text-xs font-bold uppercase tracking-wider text-[#8D989A] flex items-center gap-2"
              >
                <Film className="h-4 w-4 text-[#3DBFC4]" />
                <span className="font-cinematic tracking-widest text-[11px]">Genre</span>
              </label>
              <div className="relative">
                <select
                  id="genre-select"
                  value={selectedGenreId}
                  onChange={(e) => {
                    setSelectedGenreId(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full appearance-none rounded-xl border border-[#12383B] bg-[#1B2329]/90 px-4 py-3.5 pr-10 text-sm font-medium text-[#E5E8E6] shadow-inner transition-all hover:border-[#3DBFC4]/50 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] cursor-pointer"
                >
                  {FULL_GENRE_CATALOG.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#11161B] text-[#E5E8E6] py-1.5">
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3DBFC4]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="language-select"
                className="text-xs font-bold uppercase tracking-wider text-[#8D989A] flex items-center gap-2"
              >
                <Globe className="h-4 w-4 text-[#3DBFC4]" />
                <span className="font-cinematic tracking-widest text-[11px]">Language</span>
              </label>
              <div className="relative">
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full appearance-none rounded-xl border border-[#12383B] bg-[#1B2329]/90 px-4 py-3.5 pr-10 text-sm font-medium text-[#E5E8E6] shadow-inner transition-all hover:border-[#3DBFC4]/50 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] cursor-pointer"
                >
                  {PRIMARY_LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-[#11161B] text-[#E5E8E6] py-1.5">
                      {lang.label}
                    </option>
                  ))}
                  <optgroup label="── More Languages ──" className="bg-[#11161B] font-semibold text-[#3DBFC4]">
                    {MORE_LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-[#11161B] font-normal text-[#E5E8E6] py-1.5">
                        {lang.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3DBFC4]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Status & Match Summary */}
          <div className="mt-4 pt-4 border-t border-[#12383B]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[#8D989A]">
              <span className="text-[#8D989A]/70">Active filter:</span>
              <span className="rounded-lg bg-[#1B2329] border border-[#12383B] px-2.5 py-1 text-[#3DBFC4] font-semibold">
                Genre: {activeGenre.name}
              </span>
              <span className="rounded-lg bg-[#1B2329] border border-[#12383B] px-2.5 py-1 text-[#3DBFC4] font-semibold">
                Language: {selectedLanguage === 'all' ? 'All Languages (No restriction)' : selectedLanguage}
              </span>
            </div>

            <div className="text-xs text-[#8D989A]">
              Showing <span className="font-semibold text-[#E5E8E6]">{displayedMovies.length}</span> verified films
            </div>
          </div>
        </div>

        {/* Smart Fallback Ladder Notification */}
        {fallbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-[#12383B] bg-[#12383B]/60 p-3.5 text-xs text-[#E5E8E6]"
          >
            <Sparkles className="h-4 w-4 text-[#3DBFC4] shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-[#3DBFC4]">Smart Search Ladder Active: </span>
              <span>{fallbackMessage}</span>
            </div>
          </motion.div>
        )}

        {/* Active Genre Card Info (Hero Summary Banner) */}
        {selectedGenreId !== 'all' && (
          <div className="mt-6 relative overflow-hidden rounded-2xl border border-[#12383B] bg-gradient-to-r from-[#12383B]/80 via-[#11161B]/95 to-[#1B2329]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#12383B] bg-[#1B2329]/90 px-3 py-1 text-xs font-medium text-[#3DBFC4] backdrop-blur-md mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#3DBFC4]" />
                  <span className="font-cinematic uppercase tracking-wider text-[11px]">Vibe Pairing: {activeGenre.moodAffinity}</span>
                </div>
                <h2 className="font-cinema-serif text-xl sm:text-2xl font-bold text-[#E5E8E6] tracking-tight">
                  {activeGenre.name}
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#3DBFC4]">
                  {activeGenre.tagline}
                </p>
                <p className="mt-1 text-xs text-[#8D989A] leading-relaxed">
                  {activeGenre.description}
                </p>
              </div>

              <button
                id="genre-launch-mood-btn"
                onClick={() => onLaunchMoodWithGenre(activeGenre.name)}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-[#C65A32] px-4 py-2.5 text-xs font-bold text-[#E5E8E6] hover:bg-[#8F3F28] transition-all shadow-xl shadow-[#8F3F28]/40 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#E5E8E6]" />
                <span>Match Mood with {activeGenre.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* Movie Results Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#3DBFC4] mb-3" />
              <p className="text-sm font-medium text-[#E5E8E6]">
                Searching TMDB for authentic {activeGenre.name} films...
              </p>
              <p className="text-xs text-[#8D989A] mt-1">
                Applying language verification & poster validation
              </p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-[#12383B] bg-[#12383B]/40 p-8 text-center max-w-lg mx-auto">
              <Info className="h-8 w-8 text-[#3DBFC4] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#E5E8E6]">{fetchError}</p>
              <button
                onClick={() => loadGenreMovies(selectedGenreId, selectedLanguage, 1, false)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B2329] border border-[#12383B] px-4 py-2 text-xs font-medium text-[#E5E8E6] hover:bg-[#12383B] transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#3DBFC4]" />
                <span>Try Again</span>
              </button>
            </div>
          ) : displayedMovies.length === 0 ? (
            <div className="rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-12 text-center max-w-lg mx-auto">
              <Film className="h-10 w-10 text-[#8D989A]/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#E5E8E6]">No films found</h3>
              <p className="text-xs text-[#8D989A] mt-1">
                No verified {activeGenre.name} movies found in{' '}
                {selectedLanguage === 'all' ? 'any language' : selectedLanguage}.
              </p>
              {selectedLanguage !== 'all' && (
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C65A32] px-4 py-2 text-xs font-bold text-[#E5E8E6] hover:bg-[#8F3F28] transition-colors shadow-lg shadow-[#8F3F28]/40 cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-[#E5E8E6]" />
                  <span>Switch to All Languages</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedMovies.map((movie) => {
                  const inWatchlist = isWatchlist(movie.id);
                  const inFavorites = isFavorite(movie.id);

                  return (
                    <motion.div
                      key={movie.id}
                      id={`genre-movie-card-${movie.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#12383B] bg-[#11161B]/95 hover:border-[#3DBFC4]/60 hover:shadow-xl hover:shadow-[#3DBFC4]/10 transition-all"
                    >
                      {/* Movie Poster */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                        <MoviePosterImage
                          src={movie.posterUrl}
                          title={movie.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Gradient & Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11161B] via-transparent to-black/60 pointer-events-none" />

                        {/* Language & Year Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          <span className="rounded-md bg-[#11161B]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#3DBFC4] border border-[#12383B] uppercase tracking-wider">
                            {movie.language || 'Cinema'}
                          </span>
                          {movie.year && (
                            <span className="rounded-md bg-[#11161B]/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-[#8D989A] border border-[#12383B]">
                              {movie.year}
                            </span>
                          )}
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="flex items-center gap-1 rounded-md bg-[#12383B]/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-[#D58A3A] border border-[#C65A32]/40">
                            <Star className="h-3 w-3 fill-[#D58A3A]" />
                            <span>{movie.rating ? movie.rating.toFixed(1) : '7.5'}</span>
                          </div>
                        </div>

                        {/* Action Overlays */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                          <button
                            id={`genre-fav-${movie.id}`}
                            onClick={() => onToggleFavorite(movie)}
                            className={`rounded-full p-2 backdrop-blur-md transition-all cursor-pointer ${
                              inFavorites
                                ? 'bg-[#C65A32] text-[#E5E8E6]'
                                : 'bg-[#11161B]/80 text-[#8D989A] hover:bg-[#11161B] hover:text-[#C65A32] border border-[#12383B]'
                            }`}
                            title={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart className={`h-3.5 w-3.5 ${inFavorites ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            id={`genre-watch-${movie.id}`}
                            onClick={() => onToggleWatchlist(movie)}
                            className={`rounded-full p-2 backdrop-blur-md transition-all cursor-pointer ${
                              inWatchlist
                                ? 'bg-[#3DBFC4] text-neutral-950 font-bold'
                                : 'bg-[#11161B]/80 text-[#8D989A] hover:bg-[#11161B] hover:text-[#3DBFC4] border border-[#12383B]'
                            }`}
                            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${inWatchlist ? 'fill-neutral-950' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Movie Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 
                            onClick={() => onSelectMovie(movie)}
                            className="font-movie-title text-sm sm:text-base font-bold text-[#E5E8E6] line-clamp-1 group-hover:text-[#3DBFC4] transition-colors cursor-pointer uppercase tracking-[0.08em]"
                          >
                            {movie.title}
                          </h4>

                          {/* Original title if different */}
                          {movie.originalTitle && movie.originalTitle.toLowerCase() !== movie.title.toLowerCase() && (
                            <p className="text-[11px] text-[#8D989A]/80 italic line-clamp-1 mt-0.5">
                              {movie.originalTitle}
                            </p>
                          )}

                          {movie.director && (
                            <p className="text-xs text-[#8D989A] mt-1 line-clamp-1 font-cormorant italic text-sm">
                              Dir: {movie.director}
                            </p>
                          )}

                          {/* Verified TMDB Genres */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {movie.genres.slice(0, 3).map((g) => {
                              const name = typeof g === 'string' ? g : g.name;
                              return (
                                <span
                                  key={name}
                                  className="rounded bg-[#1B2329] px-1.5 py-0.5 text-[10px] font-medium text-[#8D989A] border border-[#12383B]"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>

                          <p className="text-xs text-[#8D989A] mt-2 line-clamp-2 leading-relaxed">
                            {movie.synopsis || movie.overview}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#12383B]/60 flex items-center justify-between gap-2">
                          <button
                            id={`genre-card-trailer-${movie.id}`}
                            onClick={() => onPlayTrailer(movie)}
                            className="flex items-center gap-1 text-xs font-medium text-[#3DBFC4] hover:text-[#E5E8E6] transition-colors cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 fill-[#3DBFC4]" />
                            <span>Trailer</span>
                          </button>

                          <button
                            id={`genre-card-details-${movie.id}`}
                            onClick={() => onSelectMovie(movie)}
                            className="flex items-center gap-1 text-xs font-medium text-[#8D989A] hover:text-[#E5E8E6] transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Load More Pagination */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    id="genre-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329] px-6 py-3 text-xs font-bold text-[#E5E8E6] hover:border-[#3DBFC4]/50 hover:text-[#3DBFC4] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#3DBFC4]" />
                        <span>Loading more films from TMDB...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 text-[#3DBFC4]" />
                        <span>Load More {activeGenre.name} Films</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
