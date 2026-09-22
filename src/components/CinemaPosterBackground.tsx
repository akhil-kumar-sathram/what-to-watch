'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Clapperboard, Layers, Sparkles } from 'lucide-react';
import { useCinemaTheme } from '../context/CinemaThemeContext';
import { 
  CLASSIC_CINEMA_THEMES, 
  getClassicPosterUrl, 
  getClassicBackdropUrl 
} from '../data/cinemaThemes';

export const CinemaPosterBackground: React.FC = () => {
  const { 
    activeTheme, 
    isPosterWallMode, 
    togglePosterWallMode, 
    openThemeSelector,
    failedPosterIds,
    markPosterFailed
  } = useCinemaTheme();

  const posterUrl = getClassicPosterUrl(activeTheme.poster_path, 'w780');
  const backdropUrl = getClassicBackdropUrl(activeTheme.backdrop_path, 'w1280');
  const isPosterFailed = failedPosterIds[activeTheme.id];

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        {isPosterWallMode ? (
          /* ========================================================
             MODE 1: VINTAGE POSTER WALL MODE
             Overlapping authentic classic movie posters arranged 
             like a classic Hollywood cinema lobby wall with dark glass
             ======================================================== */
          <motion.div
            key="poster-wall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-[#080A0D]"
          >
            {/* Poster Wall Grid */}
            <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 p-4 sm:p-8 opacity-30 filter brightness-[0.65] contrast-[1.15] scale-105">
              {CLASSIC_CINEMA_THEMES.slice(0, 10).map((movie, idx) => {
                const wallPoster = getClassicPosterUrl(movie.poster_path, 'w500');
                const isFailed = failedPosterIds[movie.id];
                // Natural vintage poster offsets and slight rotations
                const rotations = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.5, -2.1, 2.0, -1.5, 1.2];
                const rotation = rotations[idx % rotations.length];

                return (
                  <div
                    key={`wall-${movie.id}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-[#12383B]/70 bg-[#11161B] shadow-2xl shadow-black/90 transition-transform duration-700"
                  >
                    {wallPoster && !isFailed ? (
                      <Image
                        src={wallPoster}
                        alt={`${movie.title} (${movie.year}) classic poster`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        loading="lazy"
                        onError={() => markPosterFailed(movie.id)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#080A0D]">
                        <Clapperboard className="h-6 w-6 text-[#3DBFC4]/70 mb-1" />
                        <span className="font-cinematic text-[10px] text-[#8D989A] uppercase tracking-widest">
                          CLASSIC CINEMA
                        </span>
                        <span className="text-[11px] text-[#E5E8E6] font-bold mt-0.5">
                          {movie.title}
                        </span>
                      </div>
                    )}
                    {/* Subtle poster paper sheen overlay with teal and amber tones */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#12383B]/40 via-transparent to-[#D58A3A]/10 pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {/* Deep dark glass layer ensuring foreground UI text remains pristine */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#080A0D]/85 via-[#11161B]/70 to-[#080A0D] backdrop-blur-[2px]" />
          </motion.div>
        ) : (
          /* ========================================================
             MODE 2: SINGLE CLASSIC MOVIE POSTER THEME
             The selected classic film becomes the visual centerpiece 
             and background of the desktop discovery experience
             ======================================================== */
          <motion.div
            key={activeTheme.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[#080A0D]"
          >
            {/* Ambient Background Glow (Wide Stills / Backdrop) */}
            {backdropUrl && (
              <div className="absolute inset-0 overflow-hidden opacity-25">
                <Image
                  src={backdropUrl}
                  alt={`${activeTheme.title} ambient background`}
                  fill
                  className="object-cover filter blur-3xl scale-110"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            {/* Desktop Hero Poster Composition: Preserving Original 2:3 Aspect Ratio */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Subtle Atmospheric Light Behind the Poster - Dark Teal & Dusty Orange */}
              <div 
                className="absolute w-[620px] h-[820px] rounded-full bg-gradient-to-br from-[#3DBFC4]/20 via-[#12383B]/25 to-[#C65A32]/15 blur-3xl opacity-50" 
              />

              {/* Classic Film Poster Presentation (Desktop & Tablet) */}
              <div className="relative hidden md:block w-[380px] lg:w-[440px] xl:w-[480px] aspect-[2/3] max-h-[82vh] overflow-hidden rounded-2xl border-2 border-[#3DBFC4]/30 bg-[#080A0D] shadow-[0_25px_80px_rgba(8,10,13,0.95)] opacity-35 lg:opacity-40 transition-opacity">
                {posterUrl && !isPosterFailed ? (
                  <Image
                    src={posterUrl}
                    alt={`${activeTheme.title} classic movie poster (${activeTheme.year})`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1280px) 440px, 480px"
                    priority
                    onError={() => markPosterFailed(activeTheme.id)}
                  />
                ) : (
                  /* High-Craft Cinematic Placeholder */
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#11161B] via-[#1B2329] to-[#080A0D] p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3DBFC4]/15 border border-[#3DBFC4]/30 mb-3 shadow-inner">
                      <Clapperboard className="h-7 w-7 text-[#3DBFC4]" />
                    </div>
                    <span className="font-cinematic text-xs uppercase tracking-widest text-[#3DBFC4] font-bold">
                      CLASSIC CINEMA
                    </span>
                    <h3 className="font-cinema-serif text-lg font-bold text-[#E5E8E6] mt-1">
                      {activeTheme.title} ({activeTheme.year})
                    </h3>
                    <p className="mt-1 text-xs text-[#8D989A]">
                      Poster unavailable
                    </p>
                  </div>
                )}

                {/* Subtle vintage poster paper border & inner shadow */}
                <div className="absolute inset-0 ring-1 ring-inset ring-[#3DBFC4]/15 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(8,10,13,0.85)] pointer-events-none" />
              </div>

              {/* Mobile Hero Background (Full-bleed cover with strong dark grading) */}
              <div className="relative md:hidden w-full h-full opacity-20">
                {posterUrl && !isPosterFailed ? (
                  <Image
                    src={posterUrl}
                    alt={`${activeTheme.title} poster`}
                    fill
                    className="object-cover object-top filter blur-[2px]"
                    sizes="100vw"
                    priority
                    onError={() => markPosterFailed(activeTheme.id)}
                  />
                ) : null}
              </div>
            </div>

            {/* Dark Cinematic Vignette & Readability Grading */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,10,13,0.4)_0%,rgba(17,22,27,0.7)_60%,#080A0D_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-[#080A0D]/75 to-[#11161B]/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Analog 35mm Film Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.045] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Elegant Bottom-Right Floating Theme Watermark & Switcher Trigger */}
      <aside 
        aria-label="Current Cinema Theme"
        className="pointer-events-auto absolute bottom-4 right-4 hidden lg:flex items-center gap-2 rounded-2xl border border-[#12383B]/80 bg-[#11161B]/90 px-3.5 py-2 backdrop-blur-xl shadow-2xl transition-all hover:border-[#3DBFC4]/50 hover:bg-[#1B2329]/90 z-20"
      >
        <button
          id="desktop-theme-badge-btn"
          type="button"
          onClick={openThemeSelector}
          className="flex items-center gap-2.5 text-left focus:outline-none"
          title="Open Cinema Themes Gallery"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#080A0D] border border-[#12383B] text-[#3DBFC4]">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3DBFC4]">
                {isPosterWallMode ? 'Poster Wall Mode' : 'Cinema Theme'}
              </span>
              <span className="text-[9px] text-[#8D989A]/60">·</span>
              <span className="text-[10px] text-[#8D989A] hover:text-[#68E1E5] transition-colors">
                Change →
              </span>
            </div>
            <p className="font-cinematic text-xs font-bold text-[#E5E8E6] tracking-wide">
              {isPosterWallMode ? 'Classic Cinema Archive' : `${activeTheme.title} (${activeTheme.year})`}
            </p>
          </div>
        </button>

        <div className="h-6 w-px bg-[#12383B] mx-1" />

        <button
          id="desktop-toggle-wall-btn"
          type="button"
          onClick={togglePosterWallMode}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
            isPosterWallMode 
              ? 'bg-[#C65A32] text-[#E5E8E6] font-bold shadow-md shadow-[#8F3F28]/40' 
              : 'text-[#8D989A] hover:text-[#E5E8E6] hover:bg-[#12383B]'
          }`}
          title={isPosterWallMode ? 'Switch to Single Theme' : 'Switch to Poster Wall Mode'}
        >
          <Layers className="h-3 w-3" />
          <span>Wall</span>
        </button>
      </aside>
    </div>
  );
};
