'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Star, 
  Clock, 
  Film, 
  Heart, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Tv, 
  User, 
  Calendar, 
  Compass,
  Share2,
  Check,
  Globe
} from 'lucide-react';
import { Movie } from '../types';
import { MoviePosterImage } from './MoviePosterImage';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayTrailer: (movie: Movie) => void;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
  isWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  onClose,
  onPlayTrailer,
  isFavorite,
  onToggleFavorite,
  isWatchlist,
  onToggleWatchlist,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Keyboard navigation: Escape closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const handleShareMovie = () => {
    const text = `Check out "${movie.title}" (${movie.year}) on WHAT TO WATCH — Rated ${movie.rating}★\n${movie.synopsis}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-[#12383B] bg-[#11161B]/95 shadow-2xl my-auto text-[#E5E8E6] max-h-[92vh] flex flex-col backdrop-blur-xl"
        >
          {/* Close button top right */}
          <button
            id="movie-details-close-btn"
            onClick={onClose}
            aria-label="Close movie details"
            className="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#11161B]/80 text-[#8D989A] hover:text-[#E5E8E6] backdrop-blur-md border border-[#12383B] transition-transform hover:scale-105 hover:bg-[#1B2329] focus:outline-none focus:ring-2 focus:ring-[#3DBFC4]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="overflow-y-auto flex-1">
            {/* Large Backdrop Banner Section */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-neutral-950">
              <img
                src={movie.backdropUrl || movie.posterUrl}
                alt={`${movie.title} official backdrop`}
                loading="lazy"
                className="h-full w-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11161B] via-[#11161B]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#11161B]/80 via-transparent to-transparent" />

              {/* Floating Trailer Action on Backdrop */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  id="modal-play-trailer-hero-btn"
                  onClick={() => onPlayTrailer(movie)}
                  className="group flex items-center gap-3 rounded-full bg-[#C65A32] hover:bg-[#8F3F28] px-6 py-3.5 text-sm font-bold text-[#E5E8E6] shadow-2xl shadow-[#8F3F28]/60 backdrop-blur-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3DBFC4]"
                >
                  <Play className="h-5 w-5 fill-[#E5E8E6] text-[#E5E8E6] ml-0.5" />
                  <span className="font-cinematic tracking-wider uppercase text-xs">Watch Trailer</span>
                </button>
              </div>

              {/* Floating Match Badges */}
              <div className="absolute bottom-4 left-4 sm:left-6 flex flex-wrap items-center gap-2">
                {movie.emotionalTags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#1B2329]/90 border border-[#12383B] px-3 py-1 text-xs font-semibold text-[#68E1E5] backdrop-blur-md font-cinematic"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Movie Content Body */}
            <div className="p-5 sm:p-7 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                {/* Left: Poster Column */}
                <div className="w-36 sm:w-44 md:w-52 shrink-0 -mt-16 md:-mt-24 relative z-20">
                  <div className="overflow-hidden rounded-2xl border-2 border-[#12383B] bg-neutral-900 shadow-2xl shadow-black/80">
                    <MoviePosterImage
                      src={movie.posterUrl}
                      altTitle={movie.title}
                      aspectRatio="aspect-[2/3]"
                      priority
                      showBadge
                    />
                  </div>

                  {/* Quick Action Buttons Under Poster */}
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      id="modal-watchlist-btn"
                      onClick={() => onToggleWatchlist(movie)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all ${
                        isWatchlist
                          ? 'bg-[#3DBFC4] text-neutral-950 font-bold shadow-md shadow-[#3DBFC4]/20'
                          : 'border border-[#12383B] bg-[#1B2329] text-[#8D989A] hover:bg-[#12383B] hover:text-[#E5E8E6]'
                      }`}
                    >
                      {isWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      <span>{isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                    </button>

                    <button
                      id="modal-favorite-btn"
                      onClick={() => onToggleFavorite(movie)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all ${
                        isFavorite
                          ? 'bg-[#C65A32] text-[#E5E8E6] font-bold shadow-md shadow-[#8F3F28]/40'
                          : 'border border-[#12383B] bg-[#1B2329] text-[#8D989A] hover:bg-[#12383B] hover:text-[#C65A32]'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>

                    <button
                      id="modal-share-btn"
                      onClick={handleShareMovie}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329] py-2 px-3 text-xs font-medium text-[#8D989A] hover:bg-[#12383B] hover:text-[#E5E8E6] transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Link Copied' : 'Share Film'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Detailed Metadata & Story */}
                <div className="flex-1">
                  {/* Title & Key Stats Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#12383B]/60">
                    <div>
                      <h2 id="movie-modal-title" className="font-movie-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#E5E8E6] tracking-[0.08em] uppercase">
                        {movie.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#8D989A]">
                        <span className="flex items-center gap-1 font-semibold text-[#D58A3A]">
                          <Star className="h-4 w-4 fill-[#D58A3A]" />
                          {movie.rating} / 10
                        </span>
                        <span>·</span>
                        <span className="rounded-md bg-[#1B2329] border border-[#12383B] px-2 py-0.5 text-xs font-medium text-[#E5E8E6]">
                          {movie.rtScore}% Rotten Tomatoes
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-[#8D989A]">
                          <Clock className="h-3.5 w-3.5 text-[#8D989A]/70" />
                          {movie.runtime}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-[#8D989A]">
                          <Calendar className="h-3.5 w-3.5 text-[#8D989A]/70" />
                          {movie.year}
                        </span>
                        {movie.language && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[#3DBFC4] font-medium">
                              <Globe className="h-3.5 w-3.5 text-[#3DBFC4]" />
                              {movie.language}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TMDB Verified Genres */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {movie.genres.map((genre) => {
                      const genreName = typeof genre === 'string' ? genre : genre.name;
                      return (
                        <span
                          key={genreName}
                          className="rounded-lg border border-[#12383B] bg-[#1B2329] px-3 py-1 text-xs font-medium text-[#8D989A]"
                        >
                          {genreName}
                        </span>
                      );
                    })}
                  </div>

                  {/* Emotional Experience Analysis Section */}
                  <div className="mt-5 rounded-2xl border border-[#12383B] bg-[#1B2329]/40 p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-cinematic text-xs font-bold uppercase tracking-[0.14em] text-[#8D989A]">
                        Emotional Experience
                      </span>
                      {typeof movie.moodFitScore === 'number' && (
                        <span className="rounded-md border border-[#3DBFC4]/40 bg-[#12383B] px-2 py-0.5 text-xs font-semibold text-[#68E1E5]">
                          {movie.moodFitScore}% Mood Fit
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(movie.emotionalTypes && movie.emotionalTypes.length > 0
                        ? movie.emotionalTypes
                        : movie.emotionalTags.slice(0, 3)
                      ).map((tag, tIdx) => {
                        const iconMap: Record<string, string> = {
                          'Heartbreaking': '💔',
                          'Melancholic': '🌧',
                          'Hopeful': '🌅',
                          'Bittersweet': '🎭',
                          'Thought-Provoking': '🧠',
                          'Romantic': '❤️',
                          'Inspirational': '✨',
                          'Feel-Good': '☀️',
                          'Comforting': '🌿',
                          'Lighthearted': '🎈',
                          'Funny': '😄',
                          'Uplifting': '🌟',
                          'Emotional': '💧',
                          'Tragic': '🥀',
                          'Life-Changing': '💫',
                          'Deeply Emotional': '🌊',
                          'Dark': '🌑',
                          'Disturbing': '⚡',
                          'Intense': '🔥',
                          'Cathartic': '🕊',
                        };
                        const icon = iconMap[tag] || '✨';
                        return (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#12383B] bg-[#1B2329] px-2.5 py-1 text-xs font-semibold text-[#E5E8E6]"
                          >
                            <span>{icon}</span>
                            <span>{tag}</span>
                          </span>
                        );
                      })}
                      {movie.emotionalIntensity && (
                        <span className="inline-flex items-center rounded-lg border border-[#12383B] bg-[#1B2329] px-2.5 py-1 text-xs font-medium text-[#8D989A]">
                          Intensity: {movie.emotionalIntensity}
                        </span>
                      )}
                      {movie.endingTone && (
                        <span className="inline-flex items-center rounded-lg border border-[#12383B] bg-[#1B2329] px-2.5 py-1 text-xs font-medium text-[#8D989A] capitalize">
                          Tone: {movie.endingTone}
                        </span>
                      )}
                    </div>

                    {movie.lifeThemes && movie.lifeThemes.length > 0 && (
                      <div className="pt-2.5 border-t border-[#12383B]/60 text-xs text-[#8D989A] flex items-center gap-2">
                        <span className="font-semibold text-[#D58A3A]">Core Life Themes:</span>
                        <span className="capitalize">{movie.lifeThemes.join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Personalized Reason: "Why this fits you" */}
                  <div className="mt-6 rounded-2xl border border-[#D58A3A]/40 bg-[#1B2329]/90 p-4 sm:p-5 shadow-inner">
                    <div className="flex items-center gap-2 text-[#D58A3A] font-bold text-sm mb-2">
                      <Sparkles className="h-4 w-4 text-[#D58A3A] shrink-0" />
                      <span className="font-cinematic uppercase tracking-[0.14em] text-xs font-bold">Why this fits you</span>
                    </div>
                    <p className="text-sm text-[#E5E8E6] leading-relaxed">
                      {movie.whyItFits}
                    </p>
                  </div>

                  {/* Synopsis */}
                  <div className="mt-6">
                    <h3 className="font-cinematic text-xs font-bold uppercase tracking-[0.16em] text-[#8D989A] mb-2">
                      Synopsis
                    </h3>
                    <p className="text-sm sm:text-base text-[#8D989A] leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>

                  {/* Cast & Director */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#12383B] bg-[#1B2329]/40 p-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-[#8D989A]/70 block mb-1 font-medium font-cinematic uppercase tracking-wider text-[10px]">Director</span>
                      <span className="font-semibold text-[#E5E8E6] font-cormorant italic text-base">{movie.director}</span>
                    </div>
                    <div>
                      <span className="text-[#8D989A]/70 block mb-1 font-medium font-cinematic uppercase tracking-wider text-[10px]">Starring Cast</span>
                      <span className="text-[#8D989A] font-medium line-clamp-2">
                        {movie.cast.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Streaming Platforms */}
                  {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-[#12383B]/60">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#8D989A]">
                        <Tv className="h-4 w-4 text-[#3DBFC4]" />
                        <span>Where to watch:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {movie.streamingPlatforms.map((platform, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 rounded-lg border border-[#12383B] bg-[#1B2329] px-3 py-1.5 text-xs text-[#E5E8E6]"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#3DBFC4]" />
                            <span className="font-medium">{platform.name}</span>
                            <span className="text-[10px] text-[#8D989A]">({platform.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
