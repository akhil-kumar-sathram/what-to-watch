'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Sparkles,
  ArrowRight,
  MessageSquareHeart,
  Check,
  Film,
  Clapperboard
} from 'lucide-react';
import { MoodType } from '../types';
import { 
  QUICK_MOOD_OPTIONS, 
  QuickMoodOption, 
  getTmdbBackdropUrl 
} from '../data/quickMoods';

interface DayMoodScreenProps {
  dayDescription: string;
  onChangeDescription: (desc: string) => void;
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SUGGESTIONS = [
  'Hectic day dealing with constant emails and meetings, brain is fried.',
  'Had a relaxing Sunday afternoon with coffee, feeling peaceful.',
  'Big victory at work! Feeling hyped and want to celebrate tonight.',
  'Feeling a bit lonely and reflective, need something gentle.',
  'Just bored of the same routine and need something truly thrilling.',
];

export const DayMoodScreen: React.FC<DayMoodScreenProps> = ({
  dayDescription,
  onChangeDescription,
  selectedMood,
  onSelectMood,
  onContinue,
  onBack,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [moodOptions, setMoodOptions] = useState<QuickMoodOption[]>(QUICK_MOOD_OPTIONS);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/quick-moods')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setMoodOptions(data.data);
        }
      })
      .catch(() => {
        // Silently retain curated verified TMDB options if API is unreachable
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleImageError = (mood: string) => {
    setFailedImages((prev) => ({ ...prev, [mood]: true }));
  };

  const canProceed = Boolean(selectedMood || dayDescription.trim().length > 2);

  return (
    <div className="relative min-h-[calc(100vh-65px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Step Indicator Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            id="day-mood-back-btn"
            onClick={onBack}
            className="text-xs font-medium text-[#8D989A] transition-colors hover:text-[#E5E8E6]"
          >
            ← Back to Home
          </button>
          <span className="font-cinematic text-xs uppercase tracking-[0.18em] text-[#3DBFC4] font-semibold">
            Step 1 of 3 · Emotional Baseline
          </span>
        </div>

        {/* Section Heading */}
        <div className="text-center sm:text-left mb-8">
          <h1 className="font-cinema-serif text-3xl font-bold text-[#E5E8E6] sm:text-4xl md:text-5xl tracking-tight">
            How was your day?
          </h1>
          <p className="mt-3 font-cormorant text-base sm:text-lg text-[#8D989A] italic">
            Tell us about your day, and choose a mood that speaks to you tonight.
          </p>
        </div>

        {/* Day Description & Direct Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-stretch">
          {/* Left column: Describe your day in your own words */}
          <div className="md:col-span-8 relative flex flex-col justify-between rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-5 backdrop-blur-xl shadow-2xl transition-all focus-within:border-[#3DBFC4]/60 focus-within:ring-1 focus-within:ring-[#3DBFC4]/30">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-[#8D989A]">
                <span className="flex items-center gap-1.5 font-medium text-[#E5E8E6]">
                  <MessageSquareHeart className="h-4 w-4 text-[#3DBFC4]" />
                  Describe your day in your own words
                </span>
                <span className="text-[#8D989A]">{dayDescription.length} characters</span>
              </div>

              <textarea
                id="day-description-textarea"
                rows={4}
                value={dayDescription}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="e.g. Work was exhausting with endless meetings, feeling completely drained and want to turn my brain off... OR: Had an amazing coffee date and feeling on top of the world!"
                className="w-full resize-none bg-transparent text-sm sm:text-base text-[#E5E8E6] placeholder-[#8D989A]/50 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Quick inspiration chips */}
            <div className="mt-3 border-t border-[#12383B]/60 pt-3">
              <p className="text-[11px] font-medium text-[#8D989A] mb-2 font-cinematic uppercase tracking-wider">
                Quick prompts (click to auto-fill):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((text, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangeDescription(text)}
                    className="rounded-lg border border-[#12383B] bg-[#1B2329]/70 px-2.5 py-1 text-xs text-[#8D989A] transition-colors hover:border-[#3DBFC4]/50 hover:bg-[#12383B]/50 hover:text-[#E5E8E6]"
                  >
                    "{text.slice(0, 36)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Analyze My Mood primary action */}
          <div className="md:col-span-4 rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between items-stretch gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12383B]/60 border border-[#3DBFC4]/40 px-2.5 py-1 text-xs font-medium text-[#3DBFC4]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3DBFC4]" />
                  AI Mood Engine
                </span>
                {selectedMood && (
                  <span className="text-[11px] text-[#8D989A]">
                    Mood: <strong className="text-[#3DBFC4]">{selectedMood}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8D989A] leading-relaxed pt-1 font-cormorant italic text-sm">
                {canProceed ? (
                  <span className="text-[#68E1E5] font-medium">
                    Ready to analyze! Discover cinema curated for your emotional state.
                  </span>
                ) : (
                  <span>
                    Describe your day or choose a mood from the options below to get started.
                  </span>
                )}
              </p>
            </div>

            <div>
              <button
                id="day-mood-continue-btn"
                type="button"
                disabled={!canProceed}
                onClick={onContinue}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 px-5 text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3DBFC4] focus:ring-offset-2 focus:ring-offset-[#080A0D] ${
                  canProceed
                    ? 'bg-gradient-to-r from-[#C65A32] via-[#8F3F28] to-[#C65A32] text-[#E5E8E6] shadow-lg shadow-[#C65A32]/40 border border-[#D58A3A]/70 hover:shadow-[#D58A3A]/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                    : 'cursor-not-allowed bg-[#1B2329]/40 text-[#8D989A]/40 border border-[#12383B]'
                }`}
              >
                <span className="font-cinematic tracking-wider">Analyze My Mood</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Mood Options Header */}
        <div className="mt-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="font-cinema-serif text-2xl sm:text-3xl font-bold text-[#E5E8E6] tracking-tight">
                Quick Mood Options
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#8D989A] font-cormorant italic">
                Choose a mood that matches how you feel today.
              </p>
            </div>
            {selectedMood && (
              <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#12383B] border border-[#3DBFC4]/60 px-3 py-1 text-xs font-semibold text-[#68E1E5]">
                <Check className="h-3.5 w-3.5 text-[#3DBFC4]" />
                Active Selection: {selectedMood}
              </span>
            )}
          </div>

          {/* Movie Poster Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {moodOptions.map((item) => {
              const isSelected = selectedMood === item.mood;
              const backdropUrl = getTmdbBackdropUrl(item.movie.backdrop_path, 'w780');
              const hasValidImage = Boolean(backdropUrl && !failedImages[item.mood]);

              return (
                <button
                  key={item.mood}
                  id={`mood-card-${item.mood.toLowerCase()}`}
                  type="button"
                  onClick={() => onSelectMood(item.mood)}
                  className={`group relative aspect-[16/10.5] w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#3DBFC4]/60 focus:ring-offset-2 focus:ring-offset-[#080A0D] cursor-pointer ${
                    isSelected
                      ? `${item.borderGlow} ring-2 scale-[1.01] shadow-2xl`
                      : 'border-[#12383B] bg-[#11161B]/90 hover:border-[#3DBFC4]/60 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/70'
                  }`}
                >
                  {/* Real Hollywood Movie Still / Backdrop from TMDB */}
                  {hasValidImage && backdropUrl ? (
                    <Image
                      src={backdropUrl}
                      alt={`${item.movie.title} - ${item.movie.actorCharacter}`}
                      fill
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={item.mood === 'Happy' || item.mood === 'Sad'}
                      onError={() => handleImageError(item.mood)}
                    />
                  ) : (
                    /* Fallback Placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#11161B] via-[#080A0D] to-[#1B2329] p-4 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-[#12383B] mb-2 shadow-inner">
                        <Clapperboard className="h-5 w-5 text-[#3DBFC4]" />
                      </div>
                      <span className="text-xs font-semibold text-[#E5E8E6] line-clamp-1">
                        {item.movie.title} ({item.movie.year})
                      </span>
                      <span className="mt-0.5 text-[11px] text-[#8D989A]">
                        Movie image unavailable
                      </span>
                    </div>
                  )}

                  {/* Dark Cinematic Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-[#080A0D]/60 to-black/30 pointer-events-none" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} mix-blend-overlay opacity-40 pointer-events-none`} />

                  {/* Subtle Selected Tint */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#C65A32]/15 pointer-events-none ring-1 ring-inset ring-[#D58A3A]/40" />
                  )}

                  {/* Top Bar inside Card: Movie Credit Pill & Selection Badge */}
                  <div className="relative z-10 flex w-full items-center justify-between p-3.5 sm:p-4 pointer-events-none">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#080A0D]/85 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[#8D989A] backdrop-blur-md border border-[#12383B] opacity-85 group-hover:opacity-100 transition-opacity">
                      <Film className="h-3 w-3 text-[#3DBFC4]" />
                      <span>{item.movie.title}</span>
                      <span className="text-[#8D989A]/60">({item.movie.year})</span>
                    </span>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#C65A32] border border-[#D58A3A]/60 px-2.5 py-0.5 text-[11px] font-bold text-[#E5E8E6] shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Selected
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-[#3DBFC4] transition-colors" />
                    )}
                  </div>

                  {/* Bottom Typography: Mood Name & Short Description */}
                  <div className="relative z-10 mt-auto p-4 sm:p-5 pointer-events-none">
                    <h3 className="font-cinema-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#E5E8E6] drop-shadow-md group-hover:text-[#3DBFC4] transition-colors">
                      {item.label}
                    </h3>
                    <p className="mt-1 font-cormorant text-sm sm:text-base text-[#E5E8E6]/90 font-normal leading-snug drop-shadow italic">
                      {item.tagline}
                    </p>
                    <p className="mt-1.5 text-[10px] text-[#8D989A] tracking-wider font-light uppercase">
                      {item.movie.actorCharacter}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* TMDB Official Attribution Notice */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#12383B]/60 pt-4 text-xs text-[#8D989A]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded bg-gradient-to-r from-[#01b4e4] to-[#90cea1] px-2 py-0.5 text-[10px] font-black tracking-wider text-[#0d253f]">
                TMDB
              </span>
              <span className="text-[#8D989A]">
                Official Hollywood imagery & backdrops provided by The Movie Database (TMDB).
              </span>
            </div>
            <p className="text-[11px] text-[#8D989A]/70">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
