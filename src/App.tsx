'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppScreen, MoodSurveyData, MoodType, Movie, MoodProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingScreen } from './components/LandingScreen';
import { DayMoodScreen } from './components/DayMoodScreen';
import { MoodUnderstandingScreen } from './components/MoodUnderstandingScreen';
import { QuestionsScreen } from './components/QuestionsScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { RecommendationScreen, RegenerateOption } from './components/RecommendationScreen';
import { GenreExplorerScreen } from './components/GenreExplorerScreen';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { TrailerModal } from './components/TrailerModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { ErrorFallback } from './components/ErrorFallback';
import { generateMoodInterpretation, matchMovies } from './utils/recommendationEngine';
import { 
  getInitialWatchlist, 
  getInitialFavorites, 
  persistWatchlist, 
  persistFavorites 
} from './utils/storage';
import { QUESTIONS } from './data/questions';
import { CinemaThemeProvider } from './context/CinemaThemeContext';
import { CinemaPosterBackground } from './components/CinemaPosterBackground';
import { CinemaThemeSelectorModal } from './components/CinemaThemeSelectorModal';
import { MovieSearchModal } from './components/MovieSearchModal';

const INITIAL_SURVEY_DATA: MoodSurveyData = {
  dayDescription: '',
  primaryMood: null,
  interpretedMood: 'Sounds like you need a relaxing escape tonight.',
  afterFeeling: 'Uplifted & Hopeful',
  experienceType: 'Immersive Escapism',
  preferredGenres: ['Adventure', 'Comedy'],
  avoidGenres: [],
  emotionalIntensity: 'Balanced & Engaging',
  timeAvailable: 'Standard Feature (100–130 min)',
  familiarity: 'Comfort Classic / Beloved Hit',
  languagePreference: 'Any Language',
  language: 'Any Language',
};

export default function App() {
  return (
    <CinemaThemeProvider>
      <AppContent />
    </CinemaThemeProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [surveyData, setSurveyData] = useState<MoodSurveyData>(INITIAL_SURVEY_DATA);
  const [moodProfile, setMoodProfile] = useState<MoodProfile | null>(null);
  const [dataSource, setDataSource] = useState<'tmdb' | 'curated' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Persistence for Watchlist & Favorites using localStorage
  const [watchlist, setWatchlist] = useState<Movie[]>(() => getInitialWatchlist());
  const [favorites, setFavorites] = useState<Movie[]>(() => getInitialFavorites());
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'watchlist' | 'favorites'>('watchlist');

  const [genreExploreInitialFilter, setGenreExploreInitialFilter] = useState<{ genre: string; language: string }>({
    genre: 'all',
    language: 'all',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    persistWatchlist(watchlist);
  }, [watchlist]);

  useEffect(() => {
    persistFavorites(favorites);
  }, [favorites]);

  // Handlers for Navigation and Survey
  const handleStart = () => {
    setCurrentScreen('day-mood');
  };

  const handleNavigateToGenreExplore = (genre = 'all', language = 'all') => {
    setGenreExploreInitialFilter({ genre, language });
    setCurrentScreen('genre-explore');
  };

  const handleSelectQuickMoodFromLanding = (mood: MoodType) => {
    setSurveyData((prev) => ({
      ...prev,
      primaryMood: mood,
      interpretedMood: generateMoodInterpretation(mood, prev.dayDescription),
    }));
    setCurrentScreen('day-mood');
  };

  const handleDayMoodContinue = async () => {
    const instantInterpretation = generateMoodInterpretation(
      surveyData.primaryMood,
      surveyData.dayDescription
    );
    setSurveyData((prev) => ({
      ...prev,
      interpretedMood: instantInterpretation,
    }));
    setCurrentScreen('mood-understanding');

    // Background call to /api/analyze-mood via Gemini
    try {
      setIsAnalyzingMood(true);
      const res = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayDescription: surveyData.dayDescription,
          primaryMood: surveyData.primaryMood,
          afterFeeling: surveyData.afterFeeling,
          experienceType: surveyData.experienceType,
          preferredGenres: surveyData.preferredGenres,
          avoidGenres: surveyData.avoidGenres,
          emotionalIntensity: surveyData.emotionalIntensity,
          timeAvailable: surveyData.timeAvailable,
          familiarity: surveyData.familiarity,
          languagePreference: surveyData.languagePreference || surveyData.language || 'English',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile?.interpretation) {
          setSurveyData((prev) => ({
            ...prev,
            interpretedMood: data.profile.interpretation,
          }));
        }
        if (data.profile) {
          setMoodProfile(data.profile);
        }
      }
    } catch (err) {
      console.warn('Background mood analysis note:', err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  const handleConfirmMood = () => {
    setCurrentQuestionIndex(0);
    setCurrentScreen('questions');
  };

  const handleUpdateSurvey = (key: keyof MoodSurveyData, value: any) => {
    setSurveyData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'languagePreference' ? { language: value } : {}),
      ...(key === 'language' ? { languagePreference: value } : {}),
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuestions();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setCurrentScreen('mood-understanding');
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  // Central Recommendation Fetcher
  const fetchRecommendations = async (overrideSurvey?: MoodSurveyData, overrideProfile?: MoodProfile, regenOption?: string) => {
    const activeSurvey = overrideSurvey || surveyData;
    let activeProfile = overrideProfile || moodProfile;

    setErrorMessage(null);
    if (!regenOption) {
      setCurrentScreen('loading');
    } else {
      setIsRegenerating(true);
    }

    try {
      // 1. Check or generate profile
      if (!activeProfile) {
        try {
          const analyzeRes = await fetch('/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activeSurvey),
          });
          if (analyzeRes.ok) {
            const analyzeData = await analyzeRes.json();
            if (analyzeData.profile) {
              activeProfile = analyzeData.profile;
              setMoodProfile(analyzeData.profile);
            }
          }
        } catch (e) {
          console.warn('Analyze mood fallback:', e);
        }
      }

      // 2. Fetch recommendations from server-side TMDB + Gemini pipeline
      const recRes = await fetch('/api/recommend-movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyData: activeSurvey,
          moodProfile: activeProfile,
          regenOption,
        }),
      });

      if (!recRes.ok) {
        throw new Error(`Server returned ${recRes.status}: ${recRes.statusText}`);
      }

      const recData = await recRes.json();
      const moviesList: Movie[] = recData.movies || [];

      if (recData.noResultsForLanguage || !Array.isArray(moviesList) || moviesList.length === 0) {
        setRecommendedMovies([]);
        setDataSource(recData.source || 'tmdb');
        setCurrentScreen('recommendations');
        return;
      }

      // Exact matches from TMDB verified pipeline
      const exactFive = moviesList.slice(0, 5);
      const targetLang = (activeSurvey.languagePreference || activeSurvey.language || '').trim().toLowerCase();
      const isAnyLang = !targetLang || targetLang.includes('any') || targetLang.includes('all') || targetLang.includes('open');

      // Only supplement if language is "Any Language" or if supplement strictly matches the chosen language
      if (exactFive.length < 5 && isAnyLang) {
        const supplement = matchMovies(activeSurvey);
        for (const supp of supplement) {
          if (!exactFive.some((m) => m.title.toLowerCase() === supp.title.toLowerCase())) {
            exactFive.push(supp);
          }
          if (exactFive.length === 5) break;
        }
      }

      setRecommendedMovies(exactFive);
      setDataSource(recData.source || 'tmdb');
      setCurrentScreen('recommendations');
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      // Fallback to real curated catalogue ONLY if it matches the selected language
      const curatedRealMovies = matchMovies(activeSurvey);
      if (curatedRealMovies.length > 0) {
        setRecommendedMovies(curatedRealMovies.slice(0, 5));
        setDataSource('curated');
        setCurrentScreen('recommendations');
      } else {
        // Honest empty state without falling back to English
        setRecommendedMovies([]);
        setDataSource('tmdb');
        setCurrentScreen('recommendations');
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleFinishQuestions = () => {
    fetchRecommendations();
  };

  const handleLoadingComplete = () => {
    setCurrentScreen('recommendations');
  };

  const handleReset = () => {
    setSurveyData(INITIAL_SURVEY_DATA);
    setMoodProfile(null);
    setDataSource(null);
    setCurrentQuestionIndex(0);
    setErrorMessage(null);
    setCurrentScreen('landing');
  };

  // Watchlist handlers
  const handleToggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleRemoveFromWatchlist = (movieId: string) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
  };

  // Favorites handlers
  const handleToggleFavorite = (movie: Movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handleRemoveFromFavorites = (movieId: string) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  };

  // Regenerate Recommendations Handler
  const handleRegenerate = async (option: RegenerateOption) => {
    if (option === 'change-answers') {
      setCurrentScreen('day-mood');
      return;
    }

    // Build adjusted survey parameters for the chosen direction
    let updatedSurvey = { ...surveyData };
    let updatedProfile = moodProfile ? { ...moodProfile } : null;

    if (option === 'funnier') {
      const newGenres = ['Comedy', ...surveyData.preferredGenres.filter((g) => g.toLowerCase() !== 'comedy')];
      updatedSurvey.preferredGenres = newGenres;
      updatedSurvey.afterFeeling = 'Burst of Laughter & Pure Fun';
      updatedSurvey.emotionalIntensity = 'Light & Breezy';
      if (updatedProfile) {
        updatedProfile.preferredGenres = newGenres;
        updatedProfile.desiredFeeling = 'Burst of Laughter & Pure Fun';
        updatedProfile.emotionalIntensity = 'Light & Breezy';
        updatedProfile.interpretation = 'Seeking a witty, laughter-filled film to lift your spirits tonight.';
      }
    } else if (option === 'lighter') {
      updatedSurvey.emotionalIntensity = 'Gentle & Uplifting';
      updatedSurvey.afterFeeling = 'Relaxed & Peaceful';
      updatedSurvey.avoidGenres = Array.from(new Set([...surveyData.avoidGenres, 'Horror', 'Thriller']));
      if (updatedProfile) {
        updatedProfile.emotionalIntensity = 'Gentle & Uplifting';
        updatedProfile.desiredFeeling = 'Relaxed & Peaceful';
        updatedProfile.excludedGenres = Array.from(new Set([...updatedProfile.excludedGenres, 'Horror', 'Thriller']));
        updatedProfile.interpretation = 'Craving an easygoing, comforting cinema escape with no heavy stress.';
      }
    } else if (option === 'more-emotional') {
      const newGenres = ['Drama', ...surveyData.preferredGenres.filter((g) => g.toLowerCase() !== 'drama')];
      updatedSurvey.preferredGenres = newGenres;
      updatedSurvey.afterFeeling = 'Deeply Moved & Cathartic';
      updatedSurvey.emotionalIntensity = 'Deep & Immersive';
      if (updatedProfile) {
        updatedProfile.preferredGenres = newGenres;
        updatedProfile.desiredFeeling = 'Deeply Moved & Cathartic';
        updatedProfile.emotionalIntensity = 'Deep & Immersive';
        updatedProfile.interpretation = 'Longing for poignant character journeys and emotional catharsis.';
      }
    } else if (option === 'darker') {
      const newGenres = ['Thriller', 'Mystery', ...surveyData.preferredGenres.filter((g) => !['thriller', 'mystery'].includes(g.toLowerCase()))];
      updatedSurvey.preferredGenres = newGenres;
      updatedSurvey.afterFeeling = 'Gripped & Electrified';
      updatedSurvey.emotionalIntensity = 'Intense & Edge-of-Seat';
      if (updatedProfile) {
        updatedProfile.preferredGenres = newGenres;
        updatedProfile.desiredFeeling = 'Gripped & Electrified';
        updatedProfile.emotionalIntensity = 'Intense & Edge-of-Seat';
        updatedProfile.interpretation = 'Hungry for gritty psychological suspense and unpredictable stakes.';
      }
    } else if (option === 'surprise') {
      updatedSurvey.familiarity = 'Hidden Gem / Indie Discovery';
      const surpriseGenres = ['Sci-Fi', 'Fantasy', 'Adventure'];
      updatedSurvey.preferredGenres = surpriseGenres;
      if (updatedProfile) {
        updatedProfile.discoveryPreference = 'Hidden Gem / Indie Discovery';
        updatedProfile.preferredGenres = surpriseGenres;
        updatedProfile.interpretation = 'Venturing into captivating and delightfully unexpected cinema.';
      }
    }

    setSurveyData(updatedSurvey);
    if (updatedProfile) setMoodProfile(updatedProfile);

    await fetchRecommendations(updatedSurvey, updatedProfile || undefined, option);
  };

  // Launch Mood Journey pre-focused on a genre from the Genre Explorer
  const handleLaunchMoodWithGenre = (genreName: string) => {
    setSurveyData((prev) => ({
      ...prev,
      preferredGenres: [genreName],
      experienceType: `${genreName} Masterpiece`,
      dayDescription: `Seeking outstanding cinema in the ${genreName} genre.`,
      primaryMood: 'Excited',
    }));
    setCurrentScreen('questions');
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="relative min-h-screen bg-[#08090c] text-[#e5e7eb] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Real Classic Movie Poster & Poster Wall Desktop Theme Background */}
      <CinemaPosterBackground />

      {/* Cinematic Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onReset={handleReset}
        watchlistCount={watchlist.length}
        favoritesCount={favorites.length}
        onOpenWatchlist={() => {
          setDrawerTab('watchlist');
          setIsWatchlistOpen(true);
        }}
        onOpenFavorites={() => {
          setDrawerTab('favorites');
          setIsWatchlistOpen(true);
        }}
        onNavigateToGenreExplore={() => handleNavigateToGenreExplore('all', 'all')}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Screen Router with Motion Transitions */}
      <main className="relative z-10 flex-1 flex flex-col">
        {errorMessage ? (
          <ErrorFallback
            errorMessage={errorMessage}
            onRetry={() => fetchRecommendations()}
          />
        ) : (
          <AnimatePresence mode="wait">
            {currentScreen === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <LandingScreen
                  onStart={handleStart}
                  onSelectQuickMood={handleSelectQuickMoodFromLanding}
                  onNavigateToGenreExplore={handleNavigateToGenreExplore}
                  onOpenSearch={() => setIsSearchModalOpen(true)}
                />
              </motion.div>
            )}

            {currentScreen === 'day-mood' && (
              <motion.div
                key="day-mood"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <DayMoodScreen
                  dayDescription={surveyData.dayDescription}
                  onChangeDescription={(desc) => handleUpdateSurvey('dayDescription', desc)}
                  selectedMood={surveyData.primaryMood}
                  onSelectMood={(mood) => {
                    handleUpdateSurvey('primaryMood', mood);
                    handleUpdateSurvey('interpretedMood', generateMoodInterpretation(mood, surveyData.dayDescription));
                  }}
                  onContinue={handleDayMoodContinue}
                  onBack={() => setCurrentScreen('landing')}
                />
              </motion.div>
            )}

            {currentScreen === 'mood-understanding' && (
              <motion.div
                key="mood-understanding"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <MoodUnderstandingScreen
                  interpretedMood={surveyData.interpretedMood}
                  onChangeInterpretedMood={(val) => handleUpdateSurvey('interpretedMood', val)}
                  selectedMood={surveyData.primaryMood}
                  dayDescription={surveyData.dayDescription}
                  onConfirm={handleConfirmMood}
                  onBackToDay={() => setCurrentScreen('day-mood')}
                />
              </motion.div>
            )}

            {currentScreen === 'questions' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <QuestionsScreen
                  currentQuestionIndex={currentQuestionIndex}
                  surveyData={surveyData}
                  onUpdateSurvey={handleUpdateSurvey}
                  onNextQuestion={handleNextQuestion}
                  onPrevQuestion={handlePrevQuestion}
                  onSkipQuestion={handleSkipQuestion}
                  onFinishQuestions={handleFinishQuestions}
                />
              </motion.div>
            )}

            {currentScreen === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <LoadingScreen onComplete={handleLoadingComplete} />
              </motion.div>
            )}

            {currentScreen === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <RecommendationScreen
                  movies={recommendedMovies}
                  surveyData={surveyData}
                  moodProfile={moodProfile}
                  dataSource={dataSource}
                  isRegenerating={isRegenerating}
                  onRetake={() => setCurrentScreen('day-mood')}
                  onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                  onSelectMovie={(movie) => setSelectedMovieForDetails(movie)}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onRegenerate={handleRegenerate}
                />
              </motion.div>
            )}

            {currentScreen === 'genre-explore' && (
              <motion.div
                key="genre-explore"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <GenreExplorerScreen
                  initialGenre={genreExploreInitialFilter.genre}
                  initialLanguage={genreExploreInitialFilter.language}
                  onBack={() => setCurrentScreen('landing')}
                  onSelectMovie={(movie) => setSelectedMovieForDetails(movie)}
                  onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                  onLaunchMoodWithGenre={handleLaunchMoodWithGenre}
                  isWatchlist={(id) => watchlist.some((m) => m.id === id)}
                  onToggleWatchlist={handleToggleWatchlist}
                  isFavorite={(id) => favorites.some((m) => m.id === id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Global Branded Footer */}
      {currentScreen !== 'landing' && (
        <footer id="app-global-footer" className="mt-auto border-t border-white/5 bg-[#08090c]/80 py-4 px-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-cinematic font-black tracking-[0.16em] uppercase text-white">WHAT TO WATCH</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">A movie for how you feel.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
              <span>Curated film recommendations powered by emotional matching</span>
              <span className="text-neutral-700 hidden sm:inline">·</span>
              <span className="text-neutral-500">This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
            </div>
          </div>
        </footer>
      )}

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovieForDetails}
        isOpen={Boolean(selectedMovieForDetails)}
        onClose={() => setSelectedMovieForDetails(null)}
        onPlayTrailer={(movie) => {
          setSelectedMovieForDetails(null);
          setActiveTrailerMovie(movie);
        }}
        isFavorite={selectedMovieForDetails ? favorites.some((m) => m.id === selectedMovieForDetails.id) : false}
        onToggleFavorite={handleToggleFavorite}
        isWatchlist={selectedMovieForDetails ? watchlist.some((m) => m.id === selectedMovieForDetails.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        movie={activeTrailerMovie}
        onClose={() => setActiveTrailerMovie(null)}
      />

      {/* Slide-out Watchlist & Favorites Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        initialTab={drawerTab}
        watchlist={watchlist}
        favorites={favorites}
        onRemove={handleRemoveFromWatchlist}
        onRemoveFavorite={handleRemoveFromFavorites}
        onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
        onSelectMovie={(movie) => setSelectedMovieForDetails(movie)}
      />

      {/* Classic Cinema Themes & Poster Wall Gallery Modal */}
      <CinemaThemeSelectorModal />

      {/* Global TMDB Cinema Search Modal */}
      <MovieSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMovie={(movie) => setSelectedMovieForDetails(movie)}
        onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
      />
    </div>
  );
}
