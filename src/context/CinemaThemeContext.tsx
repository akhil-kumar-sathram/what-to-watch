'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClassicMovieTheme,
  CLASSIC_CINEMA_THEMES,
  DEFAULT_THEME_ID,
  getThemeById,
} from '../data/cinemaThemes';

interface CinemaThemeContextValue {
  activeTheme: ClassicMovieTheme;
  activeThemeId: string;
  setThemeId: (id: string) => void;
  isPosterWallMode: boolean;
  setIsPosterWallMode: (enabled: boolean) => void;
  togglePosterWallMode: () => void;
  isThemeSelectorOpen: boolean;
  openThemeSelector: () => void;
  closeThemeSelector: () => void;
  failedPosterIds: Record<string, boolean>;
  markPosterFailed: (id: string) => void;
}

const CinemaThemeContext = createContext<CinemaThemeContextValue | null>(null);

const STORAGE_THEME_KEY = 'what_to_watch_classic_theme_id';
const STORAGE_WALL_KEY = 'what_to_watch_poster_wall_mode';

export const CinemaThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeThemeId, setActiveThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [isPosterWallMode, setIsPosterWallMode] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [failedPosterIds, setFailedPosterIds] = useState<Record<string, boolean>>({});

  // Restore saved theme & poster wall preference from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
      if (savedTheme && CLASSIC_CINEMA_THEMES.some((t) => t.id === savedTheme)) {
        setActiveThemeId(savedTheme);
      }
      const savedWall = localStorage.getItem(STORAGE_WALL_KEY);
      if (savedWall !== null) {
        setIsPosterWallMode(savedWall === 'true');
      }
    } catch {
      // LocalStorage access guarded
    }
  }, []);

  const handleSetTheme = (id: string) => {
    setActiveThemeId(id);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // LocalStorage access guarded
    }
  };

  const handleTogglePosterWall = () => {
    setIsPosterWallMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_WALL_KEY, String(next));
      } catch {
        // LocalStorage access guarded
      }
      return next;
    });
  };

  const handleSetPosterWallMode = (enabled: boolean) => {
    setIsPosterWallMode(enabled);
    try {
      localStorage.setItem(STORAGE_WALL_KEY, String(enabled));
    } catch {
      // LocalStorage access guarded
    }
  };

  const markPosterFailed = (id: string) => {
    setFailedPosterIds((prev) => ({ ...prev, [id]: true }));
  };

  const activeTheme = getThemeById(activeThemeId);

  return (
    <CinemaThemeContext.Provider
      value={{
        activeTheme,
        activeThemeId,
        setThemeId: handleSetTheme,
        isPosterWallMode,
        setIsPosterWallMode: handleSetPosterWallMode,
        togglePosterWallMode: handleTogglePosterWall,
        isThemeSelectorOpen,
        openThemeSelector: () => setIsThemeSelectorOpen(true),
        closeThemeSelector: () => setIsThemeSelectorOpen(false),
        failedPosterIds,
        markPosterFailed,
      }}
    >
      {children}
    </CinemaThemeContext.Provider>
  );
};

export function useCinemaTheme(): CinemaThemeContextValue {
  const context = useContext(CinemaThemeContext);
  if (!context) {
    throw new Error('useCinemaTheme must be used within a CinemaThemeProvider');
  }
  return context;
}
