'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Globe,
  Film,
  Calendar,
  Star,
  Play,
  Eye,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Movie } from '../types';
import { MoviePosterImage } from './MoviePosterImage';

interface MovieSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer?: (movie: Movie) => void;
}

const SEARCH_LANGUAGES = [
  { label: 'All Languages', value: 'all' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Malayalam', value: 'Malayalam' },
  { label: 'Kannada', value: 'Kannada' },
  { label: 'Korean', value: 'Korean' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Turkish', value: 'Turkish' },
];

const SEARCH_GENRES = [
  { label: 'All Genres', value: 'all' },
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Science Fiction', value: 'Science Fiction' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Animation', value: 'Animation' },
  { label: 'Crime', value: 'Crime' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Mystery', value: 'Mystery' },
];

export const MovieSearchModal: React.FC<MovieSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onPlayTrailer,
}) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [genre, setGenre] = useState('all');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSearched(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Search function
  const performSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        language,
        genre,
      });
      if (year) params.set('year', year);

      const res = await fetch(`/api/search-movies?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Search failed. Please try again.');
      }
      const data = await res.json();
      setResults(Array.isArray(data.movies) ? data.movies : []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'Failed to search movies.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes if query exists
  useEffect(() => {
    if (query.trim().length >= 2 && searched) {
      performSearch();
    }
  }, [language, genre, year]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-4xl rounded-3xl border border-[#12383B] bg-[#11161B]/95 p-6 sm:p-8 shadow-2xl mt-4 sm:mt-10 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#12383B]/60">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#1B2329] p-2.5 text-[#3DBFC4] border border-[#12383B] shadow-inner">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-cinema-serif text-xl sm:text-2xl font-bold text-[#E5E8E6] tracking-tight">
                  Search Global Cinema
                </h2>
                <p className="text-xs text-[#8D989A]">
                  Search millions of films across all languages and world cinemas powered by TMDB
                </p>
              </div>
            </div>

            <button
              id="search-modal-close-btn"
              onClick={onClose}
              className="rounded-full p-2 text-[#8D989A] hover:bg-[#1B2329] hover:text-[#E5E8E6] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performSearch();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8D989A]/60" />
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, original title, director, or actor..."
                className="w-full rounded-2xl border border-[#12383B] bg-[#1B2329]/90 py-3.5 pl-12 pr-10 text-sm text-[#E5E8E6] placeholder-[#8D989A]/50 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D989A] hover:text-[#E5E8E6] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              id="global-search-submit-btn"
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#C65A32] px-6 py-3.5 text-xs font-bold text-[#E5E8E6] hover:bg-[#8F3F28] transition-colors disabled:opacity-50 shrink-0 shadow-lg shadow-[#8F3F28]/40 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#3DBFC4]" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="font-cinematic tracking-wider uppercase text-[11px]">Search TMDB</span>
            </button>
          </form>

          {/* Filters Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
            {/* Language filter */}
            <div className="flex items-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329]/90 px-3 py-1.5 text-xs text-[#8D989A]">
              <Globe className="h-3.5 w-3.5 text-[#3DBFC4]" />
              <span className="text-[#8D989A]/70">Language:</span>
              <select
                id="search-filter-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[#E5E8E6] font-medium focus:outline-none cursor-pointer"
              >
                {SEARCH_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} className="bg-[#11161B] text-[#E5E8E6]">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre filter */}
            <div className="flex items-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329]/90 px-3 py-1.5 text-xs text-[#8D989A]">
              <Film className="h-3.5 w-3.5 text-[#3DBFC4]" />
              <span className="text-[#8D989A]/70">Genre:</span>
              <select
                id="search-filter-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="bg-transparent text-[#E5E8E6] font-medium focus:outline-none cursor-pointer"
              >
                {SEARCH_GENRES.map((g) => (
                  <option key={g.value} value={g.value} className="bg-[#11161B] text-[#E5E8E6]">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year filter */}
            <div className="flex items-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329]/90 px-3 py-1.5 text-xs text-[#8D989A]">
              <Calendar className="h-3.5 w-3.5 text-[#3DBFC4]" />
              <span className="text-[#8D989A]/70">Year:</span>
              <input
                id="search-filter-year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value.slice(0, 4))}
                placeholder="e.g. 2024"
                className="w-16 bg-transparent text-[#E5E8E6] font-medium focus:outline-none placeholder-[#8D989A]/50"
              />
            </div>

            {(language !== 'all' || genre !== 'all' || year) && (
              <button
                onClick={() => {
                  setLanguage('all');
                  setGenre('all');
                  setYear('');
                }}
                className="text-xs text-[#3DBFC4] hover:underline ml-auto font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Results Area */}
          <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#3DBFC4] mb-3" />
                <p className="text-sm font-medium text-[#E5E8E6]">Searching TMDB catalog...</p>
                <p className="text-xs text-[#8D989A] mt-1">Filtering authentic posters & verifying metadata</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#12383B] bg-[#12383B]/40 p-6 text-center">
                <p className="text-sm font-medium text-[#E5E8E6]">{error}</p>
              </div>
            ) : searched && results.length === 0 ? (
              <div className="rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-10 text-center">
                <Film className="h-10 w-10 text-[#8D989A]/60 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#E5E8E6]">No movies found</h3>
                <p className="text-xs text-[#8D989A] mt-1">
                  Try adjusting your keywords or clearing the language/genre filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    id={`search-result-${movie.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#12383B] bg-[#11161B] hover:border-[#3DBFC4]/60 hover:shadow-xl hover:shadow-[#3DBFC4]/10 transition-all"
                  >
                    {/* Poster + Header */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                      <MoviePosterImage
                        src={movie.backdropUrl || movie.posterUrl}
                        title={movie.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11161B] via-transparent to-black/60 pointer-events-none" />

                      {/* Language & Year */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        <span className="rounded-md bg-[#11161B]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#3DBFC4] border border-[#12383B] uppercase">
                          {movie.language}
                        </span>
                        {movie.year && (
                          <span className="rounded-md bg-[#11161B]/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-medium text-[#8D989A] border border-[#12383B]">
                            {movie.year}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {movie.rating > 0 && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <div className="flex items-center gap-1 rounded-md bg-[#12383B]/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#D58A3A] border border-[#C65A32]/40">
                            <Star className="h-3 w-3 fill-[#D58A3A]" />
                            <span>{movie.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            onSelectMovie(movie);
                            onClose();
                          }}
                          className="font-movie-title font-bold text-sm text-[#E5E8E6] line-clamp-1 group-hover:text-[#3DBFC4] transition-colors cursor-pointer tracking-wider"
                        >
                          {movie.title}
                        </h4>

                        {movie.originalTitle && movie.originalTitle.toLowerCase() !== movie.title.toLowerCase() && (
                          <p className="text-[11px] text-[#8D989A]/80 italic line-clamp-1 mt-0.5">
                            {movie.originalTitle}
                          </p>
                        )}

                        {movie.genres && movie.genres.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {movie.genres.slice(0, 3).map((g) => {
                              const name = typeof g === 'string' ? g : g.name;
                              return (
                                <span
                                  key={name}
                                  className="rounded bg-[#1B2329] px-1.5 py-0.5 text-[10px] text-[#8D989A] border border-[#12383B]"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <p className="text-xs text-[#8D989A] mt-2 line-clamp-2 leading-relaxed">
                          {movie.synopsis || movie.overview}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 pt-3 border-t border-[#12383B]/60 flex items-center justify-between">
                        <button
                          id={`search-details-btn-${movie.id}`}
                          onClick={() => {
                            onSelectMovie(movie);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-[#3DBFC4] hover:text-[#E5E8E6] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </button>

                        {onPlayTrailer && (
                          <button
                            id={`search-trailer-btn-${movie.id}`}
                            onClick={() => {
                              onPlayTrailer(movie);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-xs text-[#8D989A] hover:text-[#E5E8E6] transition-colors cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Trailer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
