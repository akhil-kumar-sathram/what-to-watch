'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  Compass, 
  Film, 
  Star, 
  Heart, 
  Flame, 
  Smile, 
  Coffee, 
  Zap, 
  Layers, 
  Globe, 
  ChevronDown, 
  ArrowRight,
  CloudRain,
  HeartCrack,
  MoreHorizontal
} from 'lucide-react';
import { MoodType } from '../types';
import { useCinemaTheme } from '../context/CinemaThemeContext';
import { FULL_GENRE_CATALOG, PRIMARY_LANGUAGE_OPTIONS, MORE_LANGUAGE_OPTIONS } from './GenreExplorerScreen';

interface LandingScreenProps {
  onStart: () => void;
  onSelectQuickMood: (mood: MoodType) => void;
  onNavigateToGenreExplore?: (genre?: string, language?: string) => void;
  onOpenSearch?: () => void;
}

interface MoodCardItem {
  mood?: MoodType;
  label: string;
  tagline: string;
  isMore?: boolean;
  icon: React.ReactNode;
  accentBorder: string;
  glowColor: string;
}

const HOMEPAGE_MOOD_CARDS: MoodCardItem[] = [
  {
    mood: 'Happy',
    label: 'Happy',
    tagline: 'Joy & warmth',
    icon: <Smile className="h-5 w-5 text-[#D58A3A]" />,
    accentBorder: 'border-[#12383B] hover:border-[#D58A3A]',
    glowColor: 'hover:shadow-[#D58A3A]/25',
  },
  {
    mood: 'Sad',
    label: 'Sad',
    tagline: 'Comforting empathy',
    icon: <CloudRain className="h-5 w-5 text-[#3DBFC4]" />,
    accentBorder: 'border-[#12383B] hover:border-[#3DBFC4]',
    glowColor: 'hover:shadow-[#3DBFC4]/25',
  },
  {
    mood: 'Romantic',
    label: 'Romantic',
    tagline: 'Poetic sparks',
    icon: <Heart className="h-5 w-5 text-[#C65A32]" />,
    accentBorder: 'border-[#12383B] hover:border-[#C65A32]',
    glowColor: 'hover:shadow-[#C65A32]/25',
  },
  {
    mood: 'Excited',
    label: 'Excited',
    tagline: 'Electric thrill',
    icon: <Zap className="h-5 w-5 text-[#68E1E5]" />,
    accentBorder: 'border-[#12383B] hover:border-[#68E1E5]',
    glowColor: 'hover:shadow-[#68E1E5]/25',
  },
  {
    mood: 'Relaxed',
    label: 'Relaxed',
    tagline: 'Serene escape',
    icon: <Coffee className="h-5 w-5 text-[#3DBFC4]" />,
    accentBorder: 'border-[#12383B] hover:border-[#3DBFC4]',
    glowColor: 'hover:shadow-[#3DBFC4]/25',
  },
  {
    mood: 'Heartbroken',
    label: 'Heartbroken',
    tagline: 'Cathartic healing',
    icon: <HeartCrack className="h-5 w-5 text-[#C65A32]" />,
    accentBorder: 'border-[#12383B] hover:border-[#C65A32]',
    glowColor: 'hover:shadow-[#C65A32]/25',
  },
  {
    mood: 'Motivated',
    label: 'Motivated',
    tagline: 'Relentless grit',
    icon: <Flame className="h-5 w-5 text-[#D58A3A]" />,
    accentBorder: 'border-[#12383B] hover:border-[#D58A3A]',
    glowColor: 'hover:shadow-[#D58A3A]/25',
  },
  {
    isMore: true,
    label: 'More Moods',
    tagline: 'All emotions',
    icon: <MoreHorizontal className="h-5 w-5 text-[#8D989A]" />,
    accentBorder: 'border-[#12383B] hover:border-[#3DBFC4]',
    glowColor: 'hover:shadow-[#3DBFC4]/25',
  },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStart,
  onSelectQuickMood,
  onNavigateToGenreExplore,
  onOpenSearch,
}) => {
  const { activeTheme, isPosterWallMode, openThemeSelector } = useCinemaTheme();
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const handleBrowseGenre = () => {
    if (onNavigateToGenreExplore) {
      onNavigateToGenreExplore(selectedGenre, selectedLanguage);
    }
  };

  return (
    <div 
      id="what-to-watch-homepage-container"
      className="relative min-h-[calc(100vh-65px)] overflow-hidden flex flex-col justify-between bg-[#080A0D]"
    >
      {/* ========================================================================= */}
      {/* 1. DESKTOP HERO BACKGROUND IMAGE                                          */}
      {/* Exactly references local asset /images/what-to-watch-desktop-bg.png       */}
      {/* background-size: cover; background-position: center center; no-repeat;   */}
      {/* ========================================================================= */}
      <div 
        id="desktop-hero-background-asset"
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url('/images/what-to-watch-desktop-bg.png')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* ========================================================================= */}
        {/* 4. CINEMATIC OVERLAY                                                      */}
        {/* Transparent gradient allowing the subject on the right to remain clearly  */}
        {/* visible, while keeping left text crisp and legible.                       */}
        {/* LEFT: dark charcoal/black transparency                                   */}
        {/* CENTER: subtle dark transparent layer                                     */}
        {/* RIGHT: slightly darker transparent layer                                  */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#080A0D]/95 via-[#080A0D]/55 to-[#080A0D]/40" />
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#080A0D]/85 via-[#080A0D]/70 to-[#080A0D]/95" />

        {/* Vertical gradient to blend seamlessly into top navbar and bottom footer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-transparent to-[#080A0D]/80" />

        {/* Subtle atmospheric Blade Runner 2049 cyan & dusty amber ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(61,191,196,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(198,90,50,0.08),transparent_60%)]" />
      </div>

      {/* Main Hero & Content Body */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col justify-between px-4 pt-4 sm:pt-6 pb-10 sm:px-6 lg:px-8">
        {/* Top Badges Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-4"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#12383B] bg-[#11161B]/90 px-3.5 py-1 text-xs font-medium text-[#E5E8E6] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#3DBFC4]" />
            <span className="font-cinematic uppercase tracking-[0.16em] text-[10px] sm:text-[11px] font-semibold text-[#3DBFC4]">
              Cinematic Emotional Matchmaker
            </span>
          </div>

          <button
            type="button"
            id="landing-theme-selector-btn"
            onClick={openThemeSelector}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#12383B] bg-[#080A0D]/85 px-3 py-1 text-xs font-medium text-[#8D989A] backdrop-blur-md hover:border-[#3DBFC4]/60 hover:text-[#E5E8E6] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3DBFC4] cursor-pointer"
          >
            {isPosterWallMode ? (
              <Layers className="h-3 w-3 text-[#3DBFC4]" />
            ) : (
              <Film className="h-3 w-3 text-[#3DBFC4]" />
            )}
            <span className="font-cinematic uppercase tracking-wider text-[10px] text-[#3DBFC4]">Theme:</span>
            <span className="text-[#E5E8E6] font-semibold text-[11px]">
              {isPosterWallMode ? 'Poster Wall' : activeTheme.title} ({activeTheme.year})
            </span>
          </button>
        </motion.div>

        {/* Hero Section Grid: Left for Content, Right leaves Background Subject Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-2 sm:py-4">
          {/* Left Column (7 cols on desktop): Strict Visual Hierarchy */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* 1. Small Label: WHAT TO WATCH */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-1 sm:mb-1.5"
            >
              <span className="font-cinematic text-xs sm:text-sm font-extrabold tracking-[0.32em] uppercase text-[#3DBFC4] drop-shadow-[0_1px_8px_rgba(61,191,196,0.3)]">
                WHAT TO WATCH
              </span>
            </motion.div>

            {/* 2. Large Headline: "A movie for how you feel." */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-cinema-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#E5E8E6] leading-[1.12] max-w-2xl"
            >
              A movie for how you feel.
            </motion.h1>

            {/* 3. The Quote: Godfather-inspired Classic Cinema Title Typography (Cinzel / Classic Serif) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-3 sm:mt-4 max-w-2xl px-1"
            >
              <p className="font-godfather-quote text-base sm:text-xl md:text-2xl font-semibold text-[#C4B08A] leading-[1.4] sm:leading-[1.45] tracking-[0.05em] sm:tracking-[0.07em] drop-shadow-[0_2px_10px_rgba(17,22,27,0.95)] [text-shadow:0_2px_8px_#11161B] selection:text-[#E5E8E6] selection:bg-[#12383B]">
                &ldquo;movies touch our hearts and awaken our vision,and change the way we see things&rdquo;
              </p>
            </motion.div>

            {/* 4. Primary CTA: FIND MY MOVIE - Prominently Above the Fold */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-5 sm:mt-6 flex flex-col items-center lg:items-start gap-3 w-full max-w-md"
            >
              <button
                id="landing-find-movie-cta"
                data-testid="find-my-movie-btn"
                onClick={onStart}
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#C65A32] via-[#8F3F28] to-[#C65A32] px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-[#E5E8E6] shadow-xl shadow-[#C65A32]/40 border-2 border-[#D58A3A]/80 transition-all duration-300 hover:scale-[1.03] hover:border-[#D58A3A] hover:shadow-2xl hover:shadow-[#D58A3A]/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBFC4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080A0D] cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2.5 font-cinematic tracking-wider uppercase">
                  <Play className="h-5 w-5 fill-[#E5E8E6] text-[#E5E8E6] transition-transform duration-300 group-hover:scale-110" />
                  <span>FIND MY MOVIE</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D58A3A]/25 via-transparent to-[#D58A3A]/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>

              {/* Secondary Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5">
                {onOpenSearch && (
                  <button
                    id="landing-search-movies-cta"
                    onClick={onOpenSearch}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#12383B] bg-[#11161B]/80 px-3.5 py-1.5 text-xs font-semibold text-[#8D989A] backdrop-blur-md transition-all duration-200 hover:border-[#3DBFC4]/60 hover:text-[#E5E8E6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3DBFC4] cursor-pointer"
                  >
                    <Film className="h-3.5 w-3.5 text-[#3DBFC4]" />
                    <span>Search TMDB Cinema</span>
                  </button>
                )}

                {onNavigateToGenreExplore && (
                  <button
                    id="landing-explore-genre-cta"
                    onClick={() => onNavigateToGenreExplore('all', 'all')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#12383B] bg-[#11161B]/80 px-3.5 py-1.5 text-xs font-semibold text-[#8D989A] backdrop-blur-md transition-all duration-200 hover:border-[#3DBFC4]/60 hover:text-[#E5E8E6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3DBFC4] cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#3DBFC4]" />
                    <span>Full Genre Explorer</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column (5 cols on desktop): Intentionally Unobstructed for Background Subject */}
          <div 
            aria-hidden="true" 
            className="hidden lg:block lg:col-span-5 min-h-[340px] pointer-events-none" 
          />
        </div>

        {/* ========================================================================= */}
        {/* 10. MOOD CARDS SECTION                                                    */}
        {/* Happy, Sad, Romantic, Excited, Relaxed, Heartbroken, Motivated, More Moods */}
        {/* Does not obstruct the main subject of the uploaded background image       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 sm:mt-8 w-full"
        >
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3DBFC4]" />
              <span className="font-cinematic text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#E5E8E6]">
                How are you feeling today?
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#8D989A] hidden sm:inline">
              Instant Mood Recommendations
            </span>
          </div>

          {/* 8 Distinct Mood Cards in Blade Runner 2049 UI Palette */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {HOMEPAGE_MOOD_CARDS.map((card) => {
              const handleClick = () => {
                if (card.isMore) {
                  onStart();
                } else if (card.mood) {
                  onSelectQuickMood(card.mood);
                }
              };

              return (
                <button
                  key={card.label}
                  id={`quick-mood-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={handleClick}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border bg-[#11161B]/85 p-3 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:bg-[#1B2329] shadow-lg cursor-pointer ${card.accentBorder} ${card.glowColor}`}
                >
                  <div className="mb-2 p-2 rounded-lg bg-[#080A0D]/80 border border-[#12383B] group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <span className="font-cinematic text-xs font-bold uppercase tracking-wider text-[#E5E8E6] group-hover:text-[#3DBFC4] transition-colors">
                    {card.label}
                  </span>
                  <span className="text-[10px] text-[#8D989A] mt-0.5 line-clamp-1">
                    {card.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* FILM ARCHIVE FILTER: GENRE & LANGUAGE SIDE BY SIDE                         */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-5 sm:mt-6 w-full max-w-2xl mx-auto lg:mx-0 rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl text-left"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="font-cinematic text-xs font-bold uppercase tracking-[0.18em] text-[#3DBFC4] flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-[#3DBFC4]" />
              Film Archive Filter
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8D989A]">Authentic TMDB Catalogue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {/* GENRE */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="landing-genre-select"
                className="text-[11px] font-bold uppercase tracking-wider text-[#8D989A] flex items-center gap-1"
              >
                <Film className="h-3 w-3 text-[#3DBFC4]" />
                <span>Genre</span>
              </label>
              <div className="relative">
                <select
                  id="landing-genre-select"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#12383B] bg-[#1B2329] px-3 py-2 pr-8 text-xs font-medium text-[#E5E8E6] shadow-inner transition-all hover:border-[#3DBFC4]/60 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] cursor-pointer"
                >
                  {FULL_GENRE_CATALOG.map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#11161B] text-[#E5E8E6] py-1">
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3DBFC4]">
                  <ChevronDown className="h-3.5 w-3.5 text-[#3DBFC4]" />
                </div>
              </div>
            </div>

            {/* LANGUAGE */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="landing-language-select"
                className="text-[11px] font-bold uppercase tracking-wider text-[#8D989A] flex items-center gap-1"
              >
                <Globe className="h-3 w-3 text-[#3DBFC4]" />
                <span>Language</span>
              </label>
              <div className="relative">
                <select
                  id="landing-language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#12383B] bg-[#1B2329] px-3 py-2 pr-8 text-xs font-medium text-[#E5E8E6] shadow-inner transition-all hover:border-[#3DBFC4]/60 focus:border-[#3DBFC4] focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] cursor-pointer"
                >
                  {PRIMARY_LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-[#11161B] text-[#E5E8E6] py-1">
                      {lang.label}
                    </option>
                  ))}
                  <optgroup label="── More Languages ──" className="bg-[#11161B] font-semibold text-[#3DBFC4]">
                    {MORE_LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-[#11161B] font-normal text-[#E5E8E6] py-1">
                        {lang.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3DBFC4]">
                  <ChevronDown className="h-3.5 w-3.5 text-[#3DBFC4]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-[#12383B]/80 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#8D989A]">
              Matches real films in {selectedLanguage === 'all' ? 'All Languages' : selectedLanguage}
            </span>
            <button
              id="landing-filter-browse-btn"
              onClick={handleBrowseGenre}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C65A32] px-3.5 py-1.5 text-xs font-bold text-[#E5E8E6] transition-all hover:bg-[#8F3F28] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#C65A32]/40 cursor-pointer"
            >
              <span>Explore Films</span>
              <ArrowRight className="h-3 w-3 text-[#E5E8E6]" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Aesthetic Cinematic Footer Teaser Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="relative z-10 border-t border-[#12383B]/80 bg-[#080A0D]/90 py-3 sm:py-4 px-4 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-[#8D989A]">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-[#3DBFC4]" />
            <span className="font-cinematic font-black tracking-[0.18em] uppercase text-[#E5E8E6]">WHAT TO WATCH</span>
            <span className="text-[#12383B]">·</span>
            <span className="text-[#8D989A] font-cormorant italic text-sm">A movie for how you feel.</span>
          </div>
          <div className="flex items-center gap-6 hidden sm:flex">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#D58A3A] fill-[#D58A3A]" />
              Verified IMDb & Rotten Tomatoes scores
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#3DBFC4]" />
              Deep emotional resonance matching
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
