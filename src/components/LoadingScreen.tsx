'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Sparkles, Clapperboard, Compass, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_PHASES = [
  { text: 'Understanding your mood...', icon: Sparkles, detail: 'Synthesizing emotional baseline and daily context' },
  { text: 'Analyzing emotional resonance...', icon: Compass, detail: 'Mapping desired afterglow and tone preferences' },
  { text: 'Filtering acclaimed cinema catalog...', icon: Clapperboard, detail: 'Scanning verified IMDb & Rotten Tomatoes ratings' },
  { text: 'Finding your movies...', icon: Film, detail: 'Generating custom matching algorithms for your 5 films' },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    // Step through each phase progressively
    const intervals = [
      setTimeout(() => setPhaseIndex(1), 700),
      setTimeout(() => setPhaseIndex(2), 1400),
      setTimeout(() => setPhaseIndex(3), 2100),
      setTimeout(() => onComplete(), 3000),
    ];

    return () => {
      intervals.forEach((timer) => clearTimeout(timer));
    };
  }, [onComplete]);

  const CurrentIcon = LOADING_PHASES[phaseIndex].icon;

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      {/* Cinematic ambient background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[#12383B]/40 via-[#3DBFC4]/20 to-[#C65A32]/25 blur-[100px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Animated Film Reel Pulse */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#3DBFC4]/40"
          />
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12383B] to-[#1B2329] shadow-xl shadow-black/80 ring-1 ring-[#3DBFC4]/50"
          >
            <CurrentIcon className="h-8 w-8 text-[#68E1E5]" />
          </motion.div>
        </div>

        {/* Phase Text Transitions */}
        <div className="min-h-[90px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-cinema-serif text-2xl sm:text-3xl font-bold text-[#E5E8E6] tracking-tight">
                {LOADING_PHASES[phaseIndex].text}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#8D989A]">
                {LOADING_PHASES[phaseIndex].detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Checklist */}
        <div className="mt-8 space-y-2 text-left rounded-2xl border border-[#12383B] bg-[#11161B]/90 p-4 backdrop-blur-md">
          {LOADING_PHASES.map((item, idx) => {
            const isFinished = idx < phaseIndex;
            const isCurrent = idx === phaseIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-colors ${
                  isFinished
                    ? 'text-[#3DBFC4] font-medium'
                    : isCurrent
                    ? 'text-[#E5E8E6] font-semibold'
                    : 'text-[#8D989A]/50'
                }`}
              >
                {isFinished ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#3DBFC4] shrink-0" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      isCurrent ? 'bg-[#3DBFC4] animate-ping' : 'bg-[#12383B]'
                    }`}
                  />
                )}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
