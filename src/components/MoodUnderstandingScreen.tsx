'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Edit3, ArrowLeft, RefreshCw } from 'lucide-react';
import { MoodType } from '../types';

interface MoodUnderstandingScreenProps {
  interpretedMood: string;
  onChangeInterpretedMood: (val: string) => void;
  selectedMood: MoodType | null;
  dayDescription: string;
  onConfirm: () => void;
  onBackToDay: () => void;
}

const PRESET_INTERPRETATIONS = [
  'Sounds like you need a relaxing escape tonight.',
  'Sounds like you need an uplifting, feel-good laugh to restore your energy.',
  'Sounds like you need an electrifying jolt of adrenaline and inspiration.',
  'Sounds like you need a quiet, thoughtful journey into another world.',
  'Sounds like you need a deeply cathartic and tender cinematic story.',
];

export const MoodUnderstandingScreen: React.FC<MoodUnderstandingScreenProps> = ({
  interpretedMood,
  onChangeInterpretedMood,
  selectedMood,
  dayDescription,
  onConfirm,
  onBackToDay,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState(interpretedMood);

  const handleSaveEdit = () => {
    if (customText.trim()) {
      onChangeInterpretedMood(customText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="h-[450px] w-[600px] rounded-full bg-gradient-to-tr from-[#12383B]/30 via-[#C65A32]/15 to-[#3DBFC4]/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Navigation Step */}
        <div className="mb-6 flex items-center justify-between">
          <button
            id="understanding-back-btn"
            onClick={onBackToDay}
            className="flex items-center gap-1.5 text-xs font-medium text-[#8D989A] transition-colors hover:text-[#E5E8E6]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Day & Mood</span>
          </button>
          <span className="text-xs uppercase tracking-widest text-[#3DBFC4] font-cinematic font-semibold">
            Step 2 of 3 · Mood Synthesis
          </span>
        </div>

        {/* Cinematic Card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-[#12383B] bg-[#11161B]/95 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          {/* Subtle Ambient Film Accent */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#12383B]/30 blur-2xl pointer-events-none" />

          {/* AI Header Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3DBFC4] mb-4 font-cinematic">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1B2329] text-[#3DBFC4] border border-[#12383B]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span>WHAT TO WATCH Emotional Intelligence</span>
          </div>

          {/* Context pill if user supplied day description or mood */}
          {(selectedMood || dayDescription) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#8D989A]">
              <span>Based on:</span>
              {selectedMood && (
                <span className="rounded-full border border-[#12383B] bg-[#1B2329] px-2.5 py-0.5 font-medium text-[#3DBFC4]">
                  Mood: {selectedMood}
                </span>
              )}
              {dayDescription && (
                <span className="italic max-w-[280px] sm:max-w-[400px] truncate text-[#E5E8E6]">
                  "{dayDescription}"
                </span>
              )}
            </div>
          )}

          {/* The Interpretation Display or Edit Box */}
          {!isEditing ? (
            <div className="my-4">
              <blockquote className="font-cormorant italic text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#E5E8E6] leading-snug">
                "{interpretedMood}"
              </blockquote>
            </div>
          ) : (
            <div className="my-4 space-y-3">
              <label className="text-xs font-medium text-[#8D989A]">
                Fine-tune your mood summary:
              </label>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full rounded-xl border border-[#12383B] bg-[#1B2329]/80 p-4 text-[#E5E8E6] text-base focus:outline-none focus:ring-1 focus:ring-[#3DBFC4] leading-relaxed"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-[#8D989A]/60 w-full">Quick alternatives:</span>
                {PRESET_INTERPRETATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomText(preset)}
                    className="rounded-md border border-[#12383B] bg-[#1B2329] px-2 py-1 text-[11px] text-[#8D989A] hover:text-[#E5E8E6] hover:bg-[#12383B]"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-[#8D989A] hover:text-[#E5E8E6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-[#3DBFC4] px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-[#68E1E5]"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Subtitle prompt */}
          <p className="mt-6 text-sm text-[#8D989A] leading-relaxed">
            Does this capture the feeling you're seeking, or would you like to refine the emotional tone before we narrow down your 5 films?
          </p>

          {/* Explicit Buttons: "That's right" and "Change it" */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-[#12383B]/60">
            {/* CTA 1: That's right */}
            <button
              id="mood-understanding-confirm-btn"
              onClick={onConfirm}
              className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-[#C65A32] hover:bg-[#8F3F28] px-6 py-3.5 text-sm font-semibold text-[#E5E8E6] shadow-lg shadow-[#8F3F28]/40 transition-all hover:scale-[1.01] active:scale-[0.99] font-cinematic uppercase tracking-wider cursor-pointer"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>That's right</span>
            </button>

            {/* CTA 2: Change it */}
            <button
              id="mood-understanding-change-btn"
              onClick={() => {
                if (isEditing) {
                  onBackToDay();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#12383B] bg-[#1B2329] px-6 py-3.5 text-sm font-medium text-[#8D989A] transition-all hover:border-[#3DBFC4] hover:bg-[#12383B] hover:text-[#E5E8E6] font-cinematic uppercase tracking-wider text-xs cursor-pointer"
            >
              {isEditing ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Choose Another Mood</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Change it</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
