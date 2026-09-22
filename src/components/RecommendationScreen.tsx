'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Clock, 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Heart,
  Sparkles, 
  Share2, 
  RotateCcw, 
  Tv, 
  LayoutGrid, 
  Maximize, 
  Check, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Smile,
  Moon,
  Zap,
  Dice5,
  Eye,
  SlidersHorizontal,
  Clapperboard,
  Globe,
  HeartCrack
} from 'lucide-react';
import { Movie, MoodSurveyData, MoodProfile } from '../types';
import { MoviePosterImage } from './MoviePosterImage';

const EMOTIONAL_TAG_ICONS: Record<string, string> = {
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

export type RegenerateOption = 
  | 'funnier' 
  | 'lighter' 
  | 'more-emotional' 
  | 'darker' 
  | 'surprise' 
  | 'change-answers';

interface RecommendationScreenProps {
  movies: Movie[];
  surveyData: MoodSurveyData;
  moodProfile?: MoodProfile | null;
  dataSource?: 'tmdb' | 'curated' | null;
  isRegenerating?: boolean;
  onRetake: () => void;
  onPlayTrailer: (movie: Movie) => void;
  onSelectMovie: (movie: Movie) => void;
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie) => void;
  favorites: Movie[];
  onToggleFavorite: (movie: Movie) => void;
  onRegenerate: (option: RegenerateOption) => void;
}

export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({
  movies,
  surveyData,
  moodProfile,
  dataSource,
  isRegenerating = false,
  onRetake,
  onPlayTrailer,
  onSelectMovie,
  watchlist,
  onToggleWatchlist,
  favorites,
  onToggleFavorite,
  onRegenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'spotlight'>('grid');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeRegenKey, setActiveRegenKey] = useState<RegenerateOption | null>(null);

  // Guarantee exactly 5 cards
  const displayMovies = movies.slice(0, 5);
  const activeSpotlightMovie = displayMovies[spotlightIndex] || displayMovies[0] || ({} as Movie);

  const isSavedInWatchlist = (movieId: string) => watchlist.some((m) => m.id === movieId);
  const isSavedInFavorites = (movieId: string) => favorites.some((m) => m.id === movieId);

  const handleShare = () => {
    const text = `WHAT TO WATCH found my movie match for today:\n${displayMovies.map((m, i) => `${i + 1}. ${m.title} (${m.year}) - ${m.rating}★`).join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTriggerRegenerate = (option: RegenerateOption) => {
    setActiveRegenKey(option);
    onRegenerate(option);
    setTimeout(() => setActiveRegenKey(null), 1200);
  };

  // Derive dynamic mood tags
  const moodTags = [
    surveyData.primaryMood ? `#${surveyData.primaryMood}` : '#Reflective',
    surveyData.afterFeeling ? `#${surveyData.afterFeeling.replace(/[^a-zA-Z]/g, '')}` : '#CinematicEscape',
    moodProfile?.energyLevel ? `#${moodProfile.energyLevel}Energy` : '#BalancedEnergy',
    surveyData.emotionalIntensity ? `#${surveyData.emotionalIntensity.split(' ')[0]}` : '#Engaging',
  ];

  // If no movies returned (e.g. strict language query with no candidates)
  if (displayMovies.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-65px)] px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="relative z-10 mx-auto max-w-xl text-center rounded-3xl border border-white/10 bg-[#12141c]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-5">
            <Globe className="h-7 w-7" />
          </div>
          <h2 className="font-cinema-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            No Films Found in {surveyData.languagePreference || 'Selected Language'}
          </h2>
          <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
            We strictly honor your language choice and never fall back to English. No verified titles were found in{' '}
            <span className="font-semibold text-amber-300">{surveyData.languagePreference || 'this language'}</span>{' '}
            matching your exact combination of genres and mood filters.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="recommendation-change-language-btn"
              onClick={onRetake}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-neutral-950 hover:bg-amber-300 transition-colors shadow-lg"
            >
              <Globe className="h-4 w-4" />
              <span>Change Language / Genres</span>
            </button>
            <button
              id="recommendation-retake-btn"
              onClick={() => onRegenerate('surprise')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try Surprise Mix</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-65px)] px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Ambient Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeSpotlightMovie?.backdropUrl && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-full max-w-6xl opacity-15 bg-cover bg-center blur-3xl transition-all duration-700"
            style={{ backgroundImage: `url('${activeSpotlightMovie.backdropUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080A0D]/90 to-[#080A0D]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Top Header Summary & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#12383B]/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3DBFC4]/40 bg-[#12383B]/80 px-3 py-1 text-xs font-semibold text-[#68E1E5]">
                <Sparkles className="h-3.5 w-3.5 text-[#3DBFC4]" />
                <span className="font-cinematic uppercase tracking-wider text-[11px]">5 Exact Matches for Your Mood</span>
              </div>
              {dataSource === 'tmdb' && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#12383B] bg-[#11161B]/90 px-2.5 py-1 text-[11px] font-medium text-[#8D989A]">
                  <span>TMDB Live Verified</span>
                </div>
              )}
            </div>
            <h1 className="font-cinema-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#E5E8E6] tracking-tight">
              Your Tonight's Cinema
            </h1>
          </div>

          {/* Controls: View switch, Share, Retake */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* View Switcher */}
            <div className="flex items-center rounded-xl border border-[#12383B] bg-[#11161B]/90 p-1 backdrop-blur-md">
              <button
                id="view-toggle-grid"
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'grid'
                    ? 'bg-[#C65A32] text-[#E5E8E6] font-bold shadow-sm'
                    : 'text-[#8D989A] hover:text-[#E5E8E6]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>All 5 Cards</span>
              </button>
              <button
                id="view-toggle-spotlight"
                onClick={() => setActiveTab('spotlight')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === 'spotlight'
                    ? 'bg-[#C65A32] text-[#E5E8E6] font-bold shadow-sm'
                    : 'text-[#8D989A] hover:text-[#E5E8E6]'
                }`}
              >
                <Maximize className="h-3.5 w-3.5" />
                <span>Spotlight</span>
              </button>
            </div>

            {/* Share CTA */}
            <button
              id="recommendation-share-btn"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B]/90 px-3.5 py-2 text-xs font-medium text-[#8D989A] hover:border-[#3DBFC4]/50 hover:text-[#E5E8E6] backdrop-blur-md transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-[#3DBFC4]" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* TONIGHT'S VIBE & REGENERATE CONTROL PANEL */}
        <div className="mt-6 rounded-3xl border border-[#12383B] bg-gradient-to-r from-[#12383B]/70 via-[#11161B]/95 to-[#1B2329]/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Tonight's Vibe Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#3DBFC4] animate-pulse" />
                <span className="font-cinematic text-xs font-bold uppercase tracking-widest text-[#3DBFC4]">
                  Tonight's Vibe
                </span>
                <span className="text-[#12383B]">·</span>
                <span className="text-xs text-[#8D989A] font-medium">
                  {surveyData.primaryMood || 'Reflective'}
                </span>
              </div>

              <p className="font-cormorant text-base sm:text-lg font-medium text-[#E5E8E6] leading-relaxed italic">
                {moodProfile?.interpretation
                  ? moodProfile.interpretation
                  : `Looking to transition from a ${surveyData.primaryMood?.toLowerCase() || 'reflective'} state into feeling ${surveyData.afterFeeling?.toLowerCase() || 'uplifted'}.`}
              </p>

              {/* Mood Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {moodTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-[#11161B]/90 border border-[#12383B] px-2.5 py-1 text-[11px] font-semibold text-[#68E1E5]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Quick Context Pill Box */}
            <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-3 border-t lg:border-t-0 lg:border-l border-[#12383B]/60 pt-4 lg:pt-0 lg:pl-6 text-xs text-[#8D989A]">
              <div className="flex flex-col">
                <span className="text-[#8D989A]/70 text-[10px] uppercase font-bold tracking-wider">Afterglow</span>
                <span className="font-semibold text-[#E5E8E6]">{surveyData.afterFeeling || 'Uplifted'}</span>
              </div>
              <div className="hidden sm:block h-7 w-[1px] bg-[#12383B]/60" />
              <div className="flex flex-col">
                <span className="text-[#8D989A]/70 text-[10px] uppercase font-bold tracking-wider">Language</span>
                <span className="font-semibold text-[#3DBFC4] flex items-center gap-1">
                  <Globe className="h-3 w-3 text-[#3DBFC4]" />
                  {surveyData.languagePreference || surveyData.language || 'English'}
                </span>
              </div>
              <div className="hidden sm:block h-7 w-[1px] bg-[#12383B]/60" />
              <div className="flex flex-col">
                <span className="text-[#8D989A]/70 text-[10px] uppercase font-bold tracking-wider">Pace & Time</span>
                <span className="font-semibold text-[#E5E8E6]">{surveyData.timeAvailable?.split(' ')[0] || 'Feature'}</span>
              </div>
            </div>
          </div>

          {/* REGENERATE OPTIONS STRIP */}
          <div className="mt-5 pt-4 border-t border-[#12383B]/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8D989A]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#3DBFC4]" />
                <span className="font-cinematic uppercase tracking-wider text-[11px]">Adjust Tonight's Recommendations:</span>
              </div>

              {/* The 6 Regenerate Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="regen-funnier-btn"
                  onClick={() => handleTriggerRegenerate('funnier')}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#1B2329]/70 px-3 py-1.5 text-xs font-medium text-[#E5E8E6] transition-all hover:border-[#3DBFC4]/60 hover:text-[#3DBFC4] active:scale-95 disabled:opacity-50"
                >
                  <Smile className="h-3.5 w-3.5 text-[#3DBFC4]" />
                  <span>Make it funnier</span>
                </button>

                <button
                  id="regen-lighter-btn"
                  onClick={() => handleTriggerRegenerate('lighter')}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#1B2329]/70 px-3 py-1.5 text-xs font-medium text-[#E5E8E6] transition-all hover:border-[#3DBFC4]/60 hover:text-[#3DBFC4] active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#3DBFC4]" />
                  <span>Make it lighter</span>
                </button>

                <button
                  id="regen-more-emotional-btn"
                  onClick={() => handleTriggerRegenerate('more-emotional')}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-[#C65A32]/50 bg-[#8F3F28]/50 px-3 py-1.5 text-xs font-medium text-[#E5E8E6] transition-all hover:border-[#C65A32] hover:bg-[#8F3F28]/70 active:scale-95 disabled:opacity-50"
                >
                  <HeartCrack className="h-3.5 w-3.5 text-[#C65A32]" />
                  <span>Make it heartbreaking / emotional</span>
                </button>

                <button
                  id="regen-darker-btn"
                  onClick={() => handleTriggerRegenerate('darker')}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B]/90 px-3 py-1.5 text-xs font-medium text-[#E5E8E6] transition-all hover:border-[#3DBFC4]/50 hover:text-[#3DBFC4] active:scale-95 disabled:opacity-50"
                >
                  <Moon className="h-3.5 w-3.5 text-[#8D989A]" />
                  <span>Make it darker</span>
                </button>

                <button
                  id="regen-surprise-btn"
                  onClick={() => handleTriggerRegenerate('surprise')}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 rounded-xl border border-[#D58A3A]/40 bg-[#1B2329]/70 px-3 py-1.5 text-xs font-medium text-[#E5E8E6] transition-all hover:border-[#D58A3A] hover:text-[#D58A3A] active:scale-95 disabled:opacity-50"
                >
                  <Dice5 className="h-3.5 w-3.5 text-[#D58A3A]" />
                  <span>Surprise me</span>
                </button>

                <button
                  id="regen-change-answers-btn"
                  onClick={() => handleTriggerRegenerate('change-answers')}
                  className="flex items-center gap-1.5 rounded-xl border border-[#3DBFC4]/50 bg-[#12383B]/60 px-3 py-1.5 text-xs font-semibold text-[#68E1E5] transition-all hover:bg-[#12383B] active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Change my answers</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON STATE (WHEN REGENERATING) */}
        {isRegenerating ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="rounded-2xl border border-[#12383B] bg-[#11161B]/60 p-5 space-y-4">
                <div className="aspect-[16/10] w-full rounded-xl bg-white/5" />
                <div className="h-6 w-3/4 rounded-md bg-white/10" />
                <div className="h-4 w-1/2 rounded-md bg-white/5" />
                <div className="h-16 w-full rounded-md bg-white/5" />
                <div className="h-14 w-full rounded-xl bg-[#C65A32]/15" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* TAB 1: CINEMATIC GRID VIEW (SHOWS ALL 5 CARDS) */}
            {activeTab === 'grid' && (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayMovies.map((movie, index) => {
                    const isWatchlist = isSavedInWatchlist(movie.id);
                    const isFavorite = isSavedInFavorites(movie.id);

                    return (
                      <motion.div
                        key={movie.id}
                        id={`movie-card-${index + 1}`}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#12383B] bg-[#11161B]/95 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#3DBFC4]/60 hover:shadow-2xl hover:shadow-[#3DBFC4]/10"
                      >
                        {/* Card Top: Large Cinematic Poster Image */}
                        <div 
                          onClick={() => onSelectMovie(movie)}
                          className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 cursor-pointer"
                        >
                          <MoviePosterImage
                            src={movie.posterUrl}
                            altTitle={movie.title}
                            aspectRatio="aspect-[16/10] w-full"
                            imageClassName="transition-transform duration-500 group-hover:scale-105"
                            showBadge
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-[#080A0D]/40 to-transparent pointer-events-none" />

                          {/* Match Number Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#080A0D]/90 px-3 py-1 text-xs font-bold text-[#3DBFC4] backdrop-blur-md border border-[#12383B]">
                            <span>#{index + 1} Match</span>
                          </div>

                          {/* Top Right: Watchlist & Favorite Buttons */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                            <button
                              id={`fav-btn-${movie.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(movie);
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                                isFavorite
                                  ? 'bg-[#C65A32] text-[#E5E8E6]'
                                  : 'bg-[#080A0D]/80 text-[#8D989A] hover:text-[#C65A32]'
                              }`}
                              title={isFavorite ? 'Remove Favorite' : 'Favorite Film'}
                            >
                              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              id={`bookmark-btn-${movie.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWatchlist(movie);
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                                isWatchlist
                                  ? 'bg-[#3DBFC4] text-neutral-950 font-bold'
                                  : 'bg-[#080A0D]/80 text-[#8D989A] hover:text-[#3DBFC4]'
                              }`}
                              title={isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            >
                              {isWatchlist ? (
                                <BookmarkCheck className="h-4 w-4" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Play Trailer Floating Overlay Button */}
                          <button
                            id={`trailer-btn-${movie.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrailer(movie);
                            }}
                            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C65A32] to-[#8F3F28] px-3 py-1.5 text-xs font-bold text-[#E5E8E6] backdrop-blur-md shadow-lg shadow-[#8F3F28]/40 transition-transform hover:scale-105 hover:brightness-110"
                          >
                            <Play className="h-3.5 w-3.5 fill-[#E5E8E6]" />
                            <span>Trailer</span>
                          </button>

                          {/* Rating & Runtime on Poster */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-semibold text-white">
                            <span className="flex items-center gap-1 rounded-md bg-[#11161B]/90 px-2 py-0.5 text-[#D58A3A] border border-[#D58A3A]/40">
                              <Star className="h-3.5 w-3.5 fill-[#D58A3A] text-[#D58A3A]" />
                              {movie.rating}
                            </span>
                            <span className="rounded-md bg-[#080A0D]/90 px-2 py-0.5 text-[#8D989A] border border-[#12383B]">
                              {movie.runtime}
                            </span>
                          </div>
                        </div>

                        {/* Card Body: Title, Metadata, Genres, Cast */}
                        <div className="flex flex-1 flex-col p-5">
                          {/* Title & Year */}
                          <div className="mb-2">
                            <div className="flex items-baseline justify-between gap-2">
                              <h2 
                                onClick={() => onSelectMovie(movie)}
                                className="font-movie-title text-base sm:text-lg font-bold text-[#E5E8E6] leading-snug group-hover:text-[#3DBFC4] transition-colors cursor-pointer uppercase tracking-[0.08em]"
                              >
                                {movie.title}
                              </h2>
                              <span className="text-xs font-semibold text-[#3DBFC4] shrink-0">
                                {movie.year}
                              </span>
                            </div>
                            <p className="text-xs text-[#8D989A] mt-1 font-cormorant italic text-sm">
                              Dir: {movie.director}
                            </p>
                          </div>

                          {/* Genre & Language Badges */}
                          <div className="mb-3 flex flex-wrap items-center gap-1.5">
                            {movie.language && (
                              <span
                                className="rounded-md bg-[#1B2329] px-2 py-0.5 text-[11px] font-semibold text-[#68E1E5] border border-[#12383B] flex items-center gap-1"
                              >
                                <Globe className="h-2.5 w-2.5 text-[#3DBFC4]" />
                                {movie.language}
                              </span>
                            )}
                            {movie.genres.map((genre) => {
                              const genreName = typeof genre === 'string' ? genre : genre.name;
                              return (
                                <span
                                  key={genreName}
                                  className="rounded-md bg-[#1B2329]/90 px-2 py-0.5 text-[11px] font-medium text-[#8D989A] border border-[#12383B]"
                                >
                                  {genreName}
                                </span>
                              );
                            })}
                          </div>

                          {/* Cast */}
                          <div className="mb-3 flex items-start gap-1.5 text-xs text-[#8D989A]">
                            <User className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#3DBFC4]" />
                            <span className="line-clamp-1">
                              Cast: {movie.cast.slice(0, 3).join(', ')}
                            </span>
                          </div>

                          {/* Synopsis */}
                          <p className="text-xs text-[#8D989A] leading-relaxed line-clamp-3 mb-3">
                            {movie.synopsis}
                          </p>

                          {/* Emotional Experience Section */}
                          <div className="mb-3 rounded-xl border border-[#12383B] bg-[#1B2329]/40 p-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D989A] mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <span>Emotional Experience</span>
                              </span>
                              {typeof movie.moodFitScore === 'number' && (
                                <span className="text-[10px] text-[#3DBFC4] font-semibold bg-[#12383B] border border-[#3DBFC4]/40 px-1.5 py-0.5 rounded">
                                  {movie.moodFitScore}% Match
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(movie.emotionalTypes && movie.emotionalTypes.length > 0
                                ? movie.emotionalTypes
                                : movie.emotionalTags.slice(0, 3)
                              ).map((type, tIdx) => {
                                const icon = EMOTIONAL_TAG_ICONS[type] || '✨';
                                return (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1 rounded-md border border-[#12383B] bg-[#1B2329] px-2 py-0.5 text-[11px] font-semibold text-[#E5E8E6]"
                                  >
                                    <span>{icon}</span>
                                    <span>{type}</span>
                                  </span>
                                );
                              })}
                              {movie.emotionalIntensity && (
                                <span className="inline-flex items-center rounded-md border border-[#12383B] bg-[#1B2329]/70 px-2 py-0.5 text-[10px] font-medium text-[#8D989A]">
                                  Intensity: {movie.emotionalIntensity}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Cinema Programme Note: "Why this fits you." */}
                          <div className="mt-auto rounded-xl border border-[#D58A3A]/40 bg-[#11161B]/95 p-3.5 text-xs shadow-inner">
                            <div className="flex items-center gap-1.5 font-cinematic uppercase tracking-widest text-[#D58A3A] text-[10px] font-bold mb-1">
                              <Sparkles className="h-3 w-3 text-[#D58A3A] shrink-0" />
                              <span>Curator's Note · Why this fits you</span>
                            </div>
                            <p className="font-cormorant text-sm sm:text-base text-[#E5E8E6] leading-relaxed italic">
                              "{movie.whyItFits}"
                            </p>
                          </div>

                          {/* Where to watch footer & Details Button */}
                          <div className="mt-4 pt-3 border-t border-[#12383B]/60 flex items-center justify-between text-[11px] text-[#8D989A]">
                            <div className="flex items-center gap-1.5">
                              <Tv className="h-3.5 w-3.5 text-[#3DBFC4]" />
                              <div className="flex items-center gap-1">
                                {movie.streamingPlatforms.slice(0, 2).map((platform, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#E5E8E6] bg-[#1B2329] border border-[#12383B]"
                                  >
                                    {platform.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              id={`view-details-btn-${movie.id}`}
                              onClick={() => onSelectMovie(movie)}
                              className="flex items-center gap-1 text-[#3DBFC4] hover:text-[#68E1E5] font-medium transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SPOTLIGHT CINEMA VIEW */}
            {activeTab === 'spotlight' && (
              <div className="mt-8">
                {/* 1-5 Movie Track Selector */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#8D989A] mr-2">
                    Select Recommendation:
                  </span>
                  {displayMovies.map((m, idx) => (
                    <button
                      key={m.id}
                      id={`spotlight-tab-${idx + 1}`}
                      onClick={() => setSpotlightIndex(idx)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                        spotlightIndex === idx
                          ? 'border border-[#C65A32] bg-[#C65A32] text-[#E5E8E6] font-bold shadow-lg shadow-[#8F3F28]/30'
                          : 'border border-[#12383B] bg-[#11161B] text-[#8D989A] hover:border-[#3DBFC4]/50'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span className="hidden sm:inline line-clamp-1 max-w-[120px]">{m.title}</span>
                    </button>
                  ))}
                </div>

                {/* Spotlight Showcase Hero Card */}
                {activeSpotlightMovie?.title && (
                  <motion.div
                    key={activeSpotlightMovie.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-3xl border border-[#12383B] bg-[#11161B]/95 backdrop-blur-2xl shadow-2xl"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      {/* Left Poster & Backdrop Column */}
                      <div 
                        onClick={() => onSelectMovie(activeSpotlightMovie)}
                        className="relative lg:col-span-5 aspect-[16/11] lg:aspect-auto overflow-hidden bg-neutral-950 cursor-pointer"
                      >
                        <MoviePosterImage
                          src={activeSpotlightMovie.posterUrl}
                          altTitle={activeSpotlightMovie.title}
                          aspectRatio="aspect-[16/11] lg:aspect-auto h-full"
                          imageClassName="h-full w-full object-cover"
                          priority
                          showBadge
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#080A0D]" />

                        {/* Play trailer hero button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            id="spotlight-play-trailer-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrailer(activeSpotlightMovie);
                            }}
                            className="group flex h-16 w-16 items-center justify-center rounded-full bg-[#C65A32] text-[#E5E8E6] shadow-2xl shadow-[#8F3F28]/60 transition-all duration-300 hover:scale-110 hover:bg-[#8F3F28]"
                          >
                            <Play className="h-7 w-7 fill-[#E5E8E6] ml-1" />
                          </button>
                        </div>
                      </div>

                      {/* Right Content Column */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                        <div>
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="rounded-full bg-[#12383B] border border-[#3DBFC4]/40 px-3 py-1 text-xs font-bold text-[#68E1E5]">
                              #{spotlightIndex + 1} Top Pick
                            </span>
                            {activeSpotlightMovie.language && (
                              <span className="flex items-center gap-1 rounded-full bg-[#1B2329] border border-[#12383B] px-3 py-1 text-xs font-semibold text-[#3DBFC4]">
                                <Globe className="h-3 w-3 text-[#3DBFC4]" />
                                {activeSpotlightMovie.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1 rounded-full bg-[#11161B] border border-[#D58A3A]/40 px-3 py-1 text-xs font-medium text-[#D58A3A]">
                              <Star className="h-3.5 w-3.5 fill-[#D58A3A] text-[#D58A3A]" />
                              {activeSpotlightMovie.rating} IMDb
                            </span>
                            <span className="rounded-full bg-[#1B2329] border border-[#12383B] px-3 py-1 text-xs font-medium text-[#8D989A]">
                              {activeSpotlightMovie.rtScore}% Rotten Tomatoes
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[#8D989A]">
                              <Clock className="h-3.5 w-3.5 text-[#3DBFC4]" />
                              {activeSpotlightMovie.runtime}
                            </span>
                          </div>

                          {/* Title */}
                          <h2 
                            onClick={() => onSelectMovie(activeSpotlightMovie)}
                            className="font-movie-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#E5E8E6] cursor-pointer hover:text-[#3DBFC4] transition-colors uppercase tracking-[0.08em] drop-shadow-md"
                          >
                            {activeSpotlightMovie.title}
                          </h2>
                          <p className="text-sm text-[#8D989A] mt-1 font-cormorant italic text-base">
                            Released {activeSpotlightMovie.year} · Directed by {activeSpotlightMovie.director}
                          </p>

                          {/* TMDB Verified Genres */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {activeSpotlightMovie.genres.map((g) => {
                              const gName = typeof g === 'string' ? g : g.name;
                              return (
                                <span
                                  key={gName}
                                  className="rounded-lg bg-[#1B2329] px-2.5 py-1 text-xs font-medium text-[#8D989A] border border-[#12383B]"
                                >
                                  {gName}
                                </span>
                              );
                            })}
                          </div>

                          {/* Cast */}
                          <div className="mt-4 text-xs text-[#8D989A]">
                            <span className="font-medium text-[#E5E8E6]">Starring: </span>
                            {activeSpotlightMovie.cast.join(', ')}
                          </div>

                          {/* Synopsis */}
                          <p className="mt-4 text-sm text-[#8D989A] leading-relaxed">
                            {activeSpotlightMovie.synopsis}
                          </p>

                          {/* Emotional Experience Section */}
                          <div className="mt-4 rounded-xl border border-[#12383B] bg-[#1B2329]/40 p-3.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#8D989A] mb-2 flex items-center justify-between">
                              <span>Emotional Experience</span>
                              {typeof activeSpotlightMovie.moodFitScore === 'number' && (
                                <span className="text-xs text-[#3DBFC4] font-semibold bg-[#12383B] border border-[#3DBFC4]/40 px-2 py-0.5 rounded">
                                  {activeSpotlightMovie.moodFitScore}% Fit
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(activeSpotlightMovie.emotionalTypes && activeSpotlightMovie.emotionalTypes.length > 0
                                ? activeSpotlightMovie.emotionalTypes
                                : activeSpotlightMovie.emotionalTags.slice(0, 3)
                              ).map((type, tIdx) => {
                                const icon = EMOTIONAL_TAG_ICONS[type] || '✨';
                                return (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#12383B] bg-[#1B2329] px-2.5 py-1 text-xs font-semibold text-[#E5E8E6]"
                                  >
                                    <span>{icon}</span>
                                    <span>{type}</span>
                                  </span>
                                );
                              })}
                              {activeSpotlightMovie.emotionalIntensity && (
                                <span className="inline-flex items-center rounded-lg border border-[#12383B] bg-[#1B2329]/70 px-2.5 py-1 text-xs font-medium text-[#8D989A]">
                                  Intensity: {activeSpotlightMovie.emotionalIntensity}
                                </span>
                              )}
                              {activeSpotlightMovie.thematicDepth && (
                                <span className="inline-flex items-center rounded-lg border border-[#12383B] bg-[#1B2329]/70 px-2.5 py-1 text-xs font-medium text-[#8D989A]">
                                  Themes: {activeSpotlightMovie.thematicDepth}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dedicated Callout: Why this fits you */}
                          <div className="mt-6 rounded-2xl border border-[#D58A3A]/40 bg-[#1B2329]/90 p-4">
                            <div className="flex items-center gap-2 font-cinematic uppercase tracking-widest text-[#D58A3A] text-xs font-bold mb-1.5">
                              <Sparkles className="h-4 w-4 text-[#D58A3A]" />
                              <span>Curator's Note · Why this fits you</span>
                            </div>
                            <p className="font-cormorant text-sm sm:text-base text-[#E5E8E6] leading-relaxed italic">
                              "{activeSpotlightMovie.whyItFits}"
                            </p>
                          </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="mt-8 pt-6 border-t border-[#12383B]/60 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#8D989A]">Streaming on:</span>
                            <div className="flex items-center gap-1.5">
                              {activeSpotlightMovie.streamingPlatforms.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="rounded-lg border border-[#12383B] bg-[#1B2329] px-2.5 py-1 text-xs font-semibold text-[#E5E8E6]"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <button
                              id="spotlight-fav-btn"
                              onClick={() => onToggleFavorite(activeSpotlightMovie)}
                              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                                isSavedInFavorites(activeSpotlightMovie.id)
                                  ? 'bg-[#C65A32] text-[#E5E8E6] font-bold'
                                  : 'border border-[#12383B] bg-[#1B2329] text-[#8D989A] hover:text-[#C65A32]'
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isSavedInFavorites(activeSpotlightMovie.id) ? 'fill-current' : ''}`} />
                              <span>Favorite</span>
                            </button>

                            <button
                              id="spotlight-bookmark-btn"
                              onClick={() => onToggleWatchlist(activeSpotlightMovie)}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                                isSavedInWatchlist(activeSpotlightMovie.id)
                                  ? 'bg-[#3DBFC4] text-neutral-950 font-bold'
                                  : 'border border-[#12383B] bg-[#1B2329] text-[#8D989A] hover:text-[#3DBFC4]'
                              }`}
                            >
                              <Bookmark className="h-4 w-4" />
                              <span>{isSavedInWatchlist(activeSpotlightMovie.id) ? 'Saved' : 'Watchlist'}</span>
                            </button>

                            <button
                              id="spotlight-full-details-btn"
                              onClick={() => onSelectMovie(activeSpotlightMovie)}
                              className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#12383B]/60 px-3.5 py-2.5 text-xs font-medium text-[#E5E8E6] hover:border-[#3DBFC4]/50 transition-all"
                            >
                              <Eye className="h-4 w-4 text-[#3DBFC4]" />
                              <span>Full Details</span>
                            </button>

                            {/* Prev / Next controls */}
                            <div className="flex items-center gap-1">
                              <button
                                disabled={spotlightIndex === 0}
                                onClick={() => setSpotlightIndex((prev) => Math.max(0, prev - 1))}
                                className="p-2 rounded-lg border border-[#12383B] text-[#8D989A] hover:text-[#E5E8E6] disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                disabled={spotlightIndex === displayMovies.length - 1}
                                onClick={() => setSpotlightIndex((prev) => Math.min(displayMovies.length - 1, prev + 1))}
                                className="p-2 rounded-lg border border-[#12383B] text-[#8D989A] hover:text-[#E5E8E6] disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </>
        )}

        {/* TMDB Official Attribution Notice */}
        <div className="mt-12 pt-6 border-t border-[#12383B]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8D989A]">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#1B2329] border border-[#12383B] px-1.5 py-0.5 font-bold tracking-wider text-[10px] text-[#3DBFC4]">
              TMDB
            </span>
            <span>Verified movie metadata and official posters sourced from The Movie Database (TMDB).</span>
          </div>
          <p className="text-[#8D989A]/70">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </div>
  );
};
