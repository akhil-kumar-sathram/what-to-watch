'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Trash2, Star, Film, Heart, Bookmark, Eye } from 'lucide-react';
import { Movie } from '../types';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Movie[];
  favorites?: Movie[];
  initialTab?: 'watchlist' | 'favorites';
  onRemove: (id: string) => void;
  onRemoveFavorite?: (id: string) => void;
  onPlayTrailer: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  favorites = [],
  initialTab = 'watchlist',
  onRemove,
  onRemoveFavorite,
  onPlayTrailer,
  onSelectMovie,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'favorites'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  if (!isOpen) return null;

  const currentList = activeTab === 'watchlist' ? watchlist : favorites;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
        <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative w-full max-w-md bg-[#11161B] border-l border-[#12383B] h-full flex flex-col shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#12383B]/70 p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#12383B]/60 to-[#3DBFC4]/20 text-[#3DBFC4] border border-[#12383B]">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 id="saved-drawer-title" className="font-cinema-serif text-lg font-bold text-[#E5E8E6] tracking-tight">
                Saved Collection
              </h3>
              <p className="text-xs text-[#8D989A]">
                {watchlist.length} in watchlist · {favorites.length} favorites
              </p>
            </div>
          </div>
          <button
            id="watchlist-close-btn"
            onClick={onClose}
            aria-label="Close saved collection"
            className="rounded-full p-2 text-[#8D989A] hover:bg-[#12383B]/50 hover:text-[#E5E8E6] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Watchlist vs Favorites */}
        <div className="flex border-b border-[#12383B]/60 bg-[#1B2329]/60 px-4 py-2 gap-2">
          <button
            id="drawer-tab-watchlist"
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-[#3DBFC4] text-neutral-950 font-bold shadow-md shadow-[#3DBFC4]/20'
                : 'text-[#8D989A] hover:text-[#E5E8E6] hover:bg-[#12383B]/40'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Watchlist</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'watchlist' ? 'bg-neutral-950/30 text-neutral-950 font-bold' : 'bg-[#1B2329] text-[#8D989A] border border-[#12383B]'
            }`}>
              {watchlist.length}
            </span>
          </button>

          <button
            id="drawer-tab-favorites"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#C65A32] text-[#E5E8E6] font-bold shadow-md shadow-[#8F3F28]/40'
                : 'text-[#8D989A] hover:text-[#E5E8E6] hover:bg-[#12383B]/40'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
            <span>Favorites</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'favorites' ? 'bg-white/20 text-[#E5E8E6] font-bold' : 'bg-[#1B2329] text-[#8D989A] border border-[#12383B]'
            }`}>
              {favorites.length}
            </span>
          </button>
        </div>

        {/* List of movies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-center px-4">
              <div className="p-4 rounded-2xl bg-[#1B2329]/40 border border-[#12383B] text-[#8D989A]/50 mb-3">
                {activeTab === 'watchlist' ? (
                  <Bookmark className="h-8 w-8 text-[#8D989A]/50" />
                ) : (
                  <Heart className="h-8 w-8 text-[#8D989A]/50" />
                )}
              </div>
              <p className="text-sm font-medium text-[#E5E8E6]">
                {activeTab === 'watchlist' ? 'Your watchlist is empty' : 'No favorites saved yet'}
              </p>
              <p className="mt-1.5 text-xs text-[#8D989A] max-w-xs leading-relaxed">
                {activeTab === 'watchlist'
                  ? 'Tap the bookmark icon on any movie card to plan your cinema night.'
                  : 'Tap the heart icon on films you love to build your personal taste profile.'}
              </p>
            </div>
          ) : (
            currentList.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex gap-3 rounded-xl border border-[#12383B] bg-[#1B2329]/50 p-3 transition-colors hover:border-[#3DBFC4]/40"
              >
                {/* Poster thumbnail */}
                <div 
                  onClick={() => onSelectMovie && onSelectMovie(movie)}
                  className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-900 cursor-pointer relative border border-[#12383B]"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-4 w-4 text-[#E5E8E6] drop-shadow" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 
                      onClick={() => onSelectMovie && onSelectMovie(movie)}
                      className="font-movie-title text-xs sm:text-sm font-bold text-[#E5E8E6] line-clamp-1 hover:text-[#3DBFC4] transition-colors cursor-pointer uppercase tracking-[0.06em]"
                    >
                      {movie.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#8D989A]">
                      <span>{movie.year}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-[#D58A3A] font-medium">
                        <Star className="h-3 w-3 fill-[#D58A3A]" />
                        {movie.rating}
                      </span>
                      <span>·</span>
                      <span>{movie.runtime}</span>
                    </div>
                    <p className="text-[11px] text-[#8D989A]/80 line-clamp-1 mt-1">
                      {movie.genres.slice(0, 2).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#12383B]/50">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`saved-play-trailer-${movie.id}`}
                        onClick={() => onPlayTrailer(movie)}
                        className="flex items-center gap-1 rounded-lg bg-[#12383B]/60 border border-[#12383B] px-2.5 py-1 text-xs font-medium text-[#3DBFC4] hover:bg-[#12383B] transition-colors"
                      >
                        <Play className="h-3 w-3 fill-[#3DBFC4]" />
                        <span>Trailer</span>
                      </button>

                      {onSelectMovie && (
                        <button
                          type="button"
                          id={`saved-view-details-${movie.id}`}
                          onClick={() => onSelectMovie(movie)}
                          className="flex items-center gap-1 rounded-lg bg-[#1B2329] border border-[#12383B] px-2.5 py-1 text-xs font-medium text-[#8D989A] hover:bg-[#12383B] hover:text-[#E5E8E6] transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      id={`saved-remove-btn-${movie.id}`}
                      onClick={() => {
                        if (activeTab === 'watchlist') {
                          onRemove(movie.id);
                        } else if (onRemoveFavorite) {
                          onRemoveFavorite(movie.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#8D989A] hover:text-[#C93B3B] hover:bg-[#12383B]/40 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
