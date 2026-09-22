import { Movie } from '../types';

const WATCHLIST_KEY = 'what_to_watch_watchlist_v1';
const FAVORITES_KEY = 'what_to_watch_favorites_v1';
const LEGACY_WATCHLIST_KEY = 'moodflix_watchlist_v1';
const LEGACY_FAVORITES_KEY = 'moodflix_favorites_v1';

export function loadSavedMovies(key: string, legacyKey?: string): Movie[] {
  try {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
    return [];
  }
}

export function saveMoviesToStorage(key: string, movies: Movie[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(movies));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

export function getInitialWatchlist(): Movie[] {
  return loadSavedMovies(WATCHLIST_KEY, LEGACY_WATCHLIST_KEY);
}

export function getInitialFavorites(): Movie[] {
  return loadSavedMovies(FAVORITES_KEY, LEGACY_FAVORITES_KEY);
}

export function persistWatchlist(movies: Movie[]): void {
  saveMoviesToStorage(WATCHLIST_KEY, movies);
}

export function persistFavorites(movies: Movie[]): void {
  saveMoviesToStorage(FAVORITES_KEY, movies);
}
