'use client';

import React from 'react';
import { Film, Bookmark, RotateCcw, Heart, Compass, Sparkles, Layers, Palette, Search } from 'lucide-react';
import { AppScreen } from '../types';
import { useCinemaTheme } from '../context/CinemaThemeContext';

interface NavbarProps {
  currentScreen: AppScreen;
  onReset: () => void;
  watchlistCount: number;
  favoritesCount?: number;
  onOpenWatchlist: () => void;
  onOpenFavorites?: () => void;
  onNavigateToGenreExplore?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onReset,
  watchlistCount,
  favoritesCount = 0,
  onOpenWatchlist,
  onOpenFavorites,
  onNavigateToGenreExplore,
  onOpenSearch,
}) => {
  const { activeTheme, isPosterWallMode, openThemeSelector } = useCinemaTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#12383B]/80 bg-[#080A0D]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <button
          id="navbar-logo-btn"
          onClick={onReset}
          className="group flex items-center gap-3 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#3DBFC4] rounded-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#12383B] via-[#1B2329] to-[#080A0D] shadow-lg shadow-black/60 ring-1 ring-[#3DBFC4]/40 transition-transform group-hover:scale-105">
            <Film className="h-5 w-5 text-[#68E1E5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinematic text-lg font-black tracking-[0.18em] uppercase text-[#E5E8E6] sm:text-xl drop-shadow-[0_1px_10px_rgba(61,191,196,0.2)]">
                WHAT TO WATCH
              </span>
              <span className="rounded-full bg-[#11161B] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3DBFC4] border border-[#12383B]">
                AI Cinema
              </span>
            </div>
            <p className="font-cormorant text-xs text-[#8D989A] hidden sm:block tracking-wider italic">
              A movie for how you feel.
            </p>
          </div>
        </button>

        {/* Center/Right Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CINEMA THEMES Selector Button */}
          <button
            id="navbar-cinema-themes-btn"
            type="button"
            onClick={openThemeSelector}
            className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#E5E8E6] transition-all hover:border-[#3DBFC4]/70 hover:bg-[#1B2329] hover:text-[#68E1E5] shadow-sm"
            title="Browse Classic Movie Poster Themes"
          >
            {isPosterWallMode ? (
              <Layers className="h-3.5 w-3.5 text-[#3DBFC4] shrink-0" />
            ) : (
              <Palette className="h-3.5 w-3.5 text-[#3DBFC4] shrink-0" />
            )}
            <span className="font-cinematic tracking-wide">CINEMA THEMES</span>
            <span className="hidden md:inline-flex items-center rounded-md bg-[#080A0D] px-1.5 py-0.5 text-[10px] font-normal text-[#3DBFC4] border border-[#12383B]">
              {isPosterWallMode ? 'Poster Wall' : activeTheme.title}
            </span>
          </button>

          {/* Explore Genres CTA */}
          {onNavigateToGenreExplore && (
            <button
              id="navbar-genre-explore-btn"
              onClick={onNavigateToGenreExplore}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                currentScreen === 'genre-explore'
                  ? 'border-[#3DBFC4] bg-[#12383B]/70 text-[#68E1E5]'
                  : 'border-[#12383B] bg-[#11161B] text-[#8D989A] hover:border-[#3DBFC4]/60 hover:text-[#E5E8E6]'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-[#3DBFC4]" />
              <span className="hidden sm:inline">Genres</span>
            </button>
          )}

          {/* Search Movies Button */}
          {onOpenSearch && (
            <button
              id="navbar-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B] px-3 py-1.5 text-xs font-medium text-[#8D989A] transition-all hover:border-[#3DBFC4]/60 hover:text-[#E5E8E6] hover:bg-[#1B2329]"
              title="Search Any Movie in Any Language"
            >
              <Search className="h-3.5 w-3.5 text-[#3DBFC4]" />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          {/* Reset / Start Over CTA */}
          {currentScreen !== 'landing' && (
            <button
              id="navbar-restart-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B] px-3 py-1.5 text-xs font-medium text-[#8D989A] transition-all hover:border-[#C65A32] hover:bg-[#1B2329] hover:text-[#E5E8E6]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Start Over</span>
            </button>
          )}

          {/* Favorites Button */}
          {onOpenFavorites && (
            <button
              id="navbar-favorites-btn"
              onClick={onOpenFavorites}
              className="relative flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B] px-3 py-1.5 text-xs font-medium text-[#8D989A] transition-all hover:border-[#C65A32]/60 hover:bg-[#1B2329] hover:text-[#E5E8E6]"
              title="View Favorites"
            >
              <Heart className={`h-3.5 w-3.5 ${favoritesCount > 0 ? 'text-[#C65A32] fill-[#C65A32]' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C65A32] px-1 text-[10px] font-bold text-[#E5E8E6]">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Watchlist Button */}
          <button
            id="navbar-watchlist-btn"
            onClick={onOpenWatchlist}
            className="relative flex items-center gap-1.5 rounded-xl border border-[#12383B] bg-[#11161B] px-3 py-1.5 text-xs font-medium text-[#8D989A] transition-all hover:border-[#D58A3A]/60 hover:bg-[#1B2329] hover:text-[#E5E8E6]"
            title="View Watchlist"
          >
            <Bookmark className={`h-3.5 w-3.5 ${watchlistCount > 0 ? 'text-[#D58A3A]' : ''}`} />
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D58A3A] px-1 text-[10px] font-bold text-[#080A0D]">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
