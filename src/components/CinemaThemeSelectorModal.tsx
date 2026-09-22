'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Film, Layers, Sparkles, Clapperboard, Calendar, ArrowRight } from 'lucide-react';
import { useCinemaTheme } from '../context/CinemaThemeContext';
import { 
  CLASSIC_CINEMA_THEMES, 
  getClassicPosterUrl, 
  ClassicMovieTheme 
} from '../data/cinemaThemes';

export const CinemaThemeSelectorModal: React.FC = () => {
  const {
    activeThemeId,
    setThemeId,
    isPosterWallMode,
    setIsPosterWallMode,
    togglePosterWallMode,
    isThemeSelectorOpen,
    closeThemeSelector,
    failedPosterIds,
    markPosterFailed,
  } = useCinemaTheme();

  if (!isThemeSelectorOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="cinema-theme-selector-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto bg-black/85 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeThemeSelector();
        }}
      >
        <motion.div
          id="cinema-theme-selector-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-[#12383B] bg-[#11161B] shadow-2xl shadow-black ring-1 ring-[#12383B]/60"
        >
          {/* Header */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#12383B] px-6 py-5 bg-gradient-to-r from-[#1B2329] via-[#11161B] to-[#1B2329]">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#12383B] text-[#3DBFC4] border border-[#3DBFC4]/40">
                  <Film className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3DBFC4] font-cinematic">
                  Cinema Themes & Poster Wall
                </span>
              </div>
              <h2 id="theme-modal-title" className="font-cinematic text-xl sm:text-2xl font-black uppercase tracking-wider text-[#E5E8E6] mt-1">
                Classic Movie Poster Themes
              </h2>
              <p className="text-xs sm:text-sm text-[#8D989A] max-w-xl mt-0.5">
                Transform your WHAT TO WATCH experience into a classic Hollywood cinema archive. Select a genuine film poster theme or enable Poster Wall mode.
              </p>
            </div>

            {/* Top Right Action Controls: Wall Toggle & Close */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Poster Wall Mode Toggle */}
              <button
                id="modal-toggle-poster-wall-btn"
                type="button"
                onClick={togglePosterWallMode}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isPosterWallMode
                    ? 'border-[#3DBFC4] bg-[#3DBFC4] text-neutral-950 font-bold shadow-lg shadow-[#3DBFC4]/25'
                    : 'border-[#12383B] bg-[#1B2329] text-[#8D989A] hover:border-[#3DBFC4] hover:bg-[#12383B] hover:text-[#E5E8E6]'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Poster Wall Mode:</span>
                <span className="font-black uppercase tracking-wider">
                  {isPosterWallMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Close Button */}
              <button
                id="modal-close-theme-btn"
                type="button"
                onClick={closeThemeSelector}
                aria-label="Close themes modal"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#12383B] bg-[#1B2329] text-[#8D989A] transition-colors hover:border-[#3DBFC4] hover:bg-[#12383B] hover:text-[#E5E8E6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mode Notification Pill */}
          {isPosterWallMode && (
            <div className="bg-[#12383B]/50 border-b border-[#12383B] px-6 py-2.5 flex items-center justify-between text-xs text-[#3DBFC4]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3DBFC4] shrink-0" />
                <span>
                  <strong>Poster Wall Mode is currently active.</strong> All classic movie posters form a vintage cinema lobby background. Click any poster below to switch back to a single theme.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPosterWallMode(false)}
                className="text-[#3DBFC4] underline hover:text-[#E5E8E6] text-xs shrink-0 ml-2 cursor-pointer"
              >
                Disable Wall
              </button>
            </div>
          )}

          {/* Poster Gallery Grid */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {CLASSIC_CINEMA_THEMES.map((theme: ClassicMovieTheme) => {
                const isSelected = activeThemeId === theme.id && !isPosterWallMode;
                const posterUrl = getClassicPosterUrl(theme.poster_path, 'w500');
                const isFailed = failedPosterIds[theme.id];

                return (
                  <button
                    key={theme.id}
                    id={`theme-card-${theme.id}`}
                    type="button"
                    onClick={() => {
                      setThemeId(theme.id);
                      if (isPosterWallMode) setIsPosterWallMode(false);
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3DBFC4] cursor-pointer ${
                      isSelected
                        ? 'border-[#3DBFC4] ring-2 ring-[#3DBFC4]/50 shadow-xl shadow-[#3DBFC4]/30 scale-[1.02]'
                        : 'border-[#12383B] bg-[#1B2329]/60 hover:border-[#3DBFC4]/50 hover:scale-[1.01] hover:shadow-lg hover:shadow-black'
                    }`}
                  >
                    {/* Poster Image Container (2:3 authentic aspect ratio) */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                      {posterUrl && !isFailed ? (
                        <Image
                          src={posterUrl}
                          alt={`${theme.title} (${theme.year})`}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading="lazy"
                          onError={() => markPosterFailed(theme.id)}
                        />
                      ) : (
                        /* Sophisticated Fallback Placeholder */
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#12383B] to-[#11161B] p-4 text-center">
                          <Clapperboard className="h-8 w-8 text-[#3DBFC4]/70 mb-2" />
                          <span className="font-cinematic text-[10px] text-[#3DBFC4] uppercase tracking-widest font-bold">
                            CLASSIC CINEMA
                          </span>
                          <span className="text-xs text-[#E5E8E6] font-semibold mt-1">
                            {theme.title}
                          </span>
                          <span className="text-[10px] text-[#8D989A] mt-0.5">
                            Poster unavailable
                          </span>
                        </div>
                      )}

                      {/* Poster Paper Overlay & Grain Sheen */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                      {/* Top Badges: Era & Selected State */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="rounded-full bg-[#11161B]/90 px-2 py-0.5 text-[10px] font-medium text-[#8D989A] backdrop-blur-md border border-[#12383B]">
                          {theme.era.split(' ')[0]}
                        </span>

                        {isSelected && (
                          <span className="flex items-center gap-1 rounded-full bg-[#3DBFC4] px-2 py-0.5 text-[10px] font-black text-neutral-950 shadow-md">
                            <Check className="h-3 w-3 stroke-[3]" />
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay: "Use as Theme →" */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#11161B]/90 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 p-4 text-center">
                        <span className="font-cinematic text-xs font-bold uppercase tracking-widest text-[#3DBFC4]">
                          Classic Cinema Theme
                        </span>
                        <h4 className="font-cinema-serif text-lg font-bold text-[#E5E8E6] mt-1">
                          {theme.title}
                        </h4>
                        <span className="text-xs text-[#8D989A] font-medium">
                          {theme.year} · Dir. {theme.director}
                        </span>
                        <p className="text-[11px] text-[#8D989A] italic mt-2 line-clamp-2">
                          “{theme.tagline}”
                        </p>
                        <div className="mt-4 flex items-center gap-1.5 rounded-full bg-[#C65A32] px-3.5 py-1.5 text-xs font-bold text-[#E5E8E6] shadow-lg shadow-[#8F3F28]/50">
                          <span className="font-cinematic tracking-wider uppercase text-[10px]">Use as Theme</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Title & Year */}
                    <div className="p-3 bg-[#11161B] border-t border-[#12383B]/60">
                      <div className="flex items-baseline justify-between gap-1">
                        <h3 className="font-cinematic text-sm font-bold uppercase tracking-wider text-[#E5E8E6] group-hover:text-[#3DBFC4] transition-colors line-clamp-1">
                          {theme.title}
                        </h3>
                        <span className="text-xs font-medium text-[#C65A32] font-mono">
                          {theme.year}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8D989A] line-clamp-1 mt-0.5">
                        {theme.director}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer with TMDB Attribution & Active Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#12383B] bg-[#11161B] px-6 py-4 text-xs text-[#8D989A]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded bg-gradient-to-r from-[#12383B] to-[#3DBFC4] px-2 py-0.5 text-[10px] font-black tracking-wider text-[#E5E8E6]">
                TMDB
              </span>
              <span className="text-[11px] text-[#8D989A]">
                Official Hollywood classic posters provided by The Movie Database (TMDB).
              </span>
            </div>
            <p className="text-[10px] text-[#8D989A]/60">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
