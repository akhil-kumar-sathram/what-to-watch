export type MoodType = 
  | 'Happy' 
  | 'Sad' 
  | 'Stressed' 
  | 'Tired' 
  | 'Excited' 
  | 'Bored' 
  | 'Relaxed' 
  | 'Romantic' 
  | 'Motivated'
  | 'Heartbroken';

export type AppScreen = 
  | 'landing' 
  | 'day-mood' 
  | 'mood-understanding' 
  | 'questions' 
  | 'loading' 
  | 'recommendations'
  | 'genre-explore';

export interface MoodSurveyData {
  dayDescription: string;
  primaryMood: MoodType | null;
  interpretedMood: string;
  afterFeeling: string;
  experienceType: string;
  preferredGenres: string[];
  avoidGenres: string[];
  emotionalIntensity: string;
  timeAvailable: string;
  familiarity: string;
  languagePreference: string;
  language?: string;
}

export interface MoodProfile {
  dayDescription: string;
  currentMood: string;
  energyLevel: 'Low' | 'Medium' | 'High';
  desiredFeeling: string;
  preferredGenres: string[];
  excludedGenres: string[];
  emotionalIntensity: string;
  runtimePreference: string;
  languagePreference: string;
  discoveryPreference: string;
  interpretation: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  iconName?: string;
}

export interface QuestionDef {
  id: keyof MoodSurveyData;
  prompt: string;
  subtitle: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export interface StreamingProvider {
  name: string;
  type: 'Stream' | 'Rent' | 'Buy';
  badgeColor: string;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  year: number;
  rating: number; // e.g., 8.6
  rtScore: number; // Rotten Tomatoes % e.g., 94
  runtime: string;
  genre_ids?: number[];
  genres: Array<{ id: number; name: string } | string>;
  tmdbGenres?: MovieGenre[];
  director: string;
  cast: string[];
  synopsis: string;
  overview?: string;
  whyItFits: string;
  posterPath?: string;
  posterUrl: string;
  backdropPath?: string;
  backdropUrl: string;
  originalLanguage?: string;
  trailerYoutubeId: string;
  trailerUrl?: string;
  streamingPlatforms: StreamingProvider[];
  emotionalTags: string[];
  vibeIntensity: 'Gentle' | 'Moderate' | 'Intense';
  language: string;
  era: 'Classic' | 'Indie' | 'Modern Blockbuster';
  emotionalTypes?: string[];
  emotionalIntensity?: string;
  endingTone?: string;
  thematicDepth?: string;
  lifeThemes?: string[];
  moodFitScore?: number;
  posterVerified?: boolean;
  posterSource?: 'tmdb_official';
}
