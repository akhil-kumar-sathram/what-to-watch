'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sun, 
  Coffee, 
  Zap, 
  Compass, 
  HeartCrack, 
  Smile, 
  Sparkles, 
  Home, 
  Flame, 
  Heart, 
  Globe, 
  Drama, 
  Rocket, 
  Search, 
  Palette, 
  Wand2, 
  ShieldAlert, 
  Clock, 
  HeartOff, 
  Activity, 
  X, 
  CheckCircle2, 
  Feather, 
  Sliders, 
  Volume2, 
  Hourglass, 
  Film, 
  Maximize2, 
  Star, 
  Sparkle, 
  Award, 
  Languages 
} from 'lucide-react';
import { MoodSurveyData } from '../types';
import { QUESTIONS } from '../data/questions';

interface QuestionsScreenProps {
  currentQuestionIndex: number;
  surveyData: MoodSurveyData;
  onUpdateSurvey: (key: keyof MoodSurveyData, value: any) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onSkipQuestion: () => void;
  onFinishQuestions: () => void;
}

// Icon mapper helper
const renderIcon = (iconName?: string) => {
  const iconProps = { className: 'h-5 w-5' };
  switch (iconName) {
    case 'Sun': return <Sun {...iconProps} />;
    case 'Coffee': return <Coffee {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'Compass': return <Compass {...iconProps} />;
    case 'HeartCrack': return <HeartCrack {...iconProps} />;
    case 'Smile': return <Smile {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Home': return <Home {...iconProps} />;
    case 'Flame': return <Flame {...iconProps} />;
    case 'Heart': return <Heart {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'Drama': return <Drama {...iconProps} />;
    case 'Rocket': return <Rocket {...iconProps} />;
    case 'Search': return <Search {...iconProps} />;
    case 'Palette': return <Palette {...iconProps} />;
    case 'Wand2': return <Wand2 {...iconProps} />;
    case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'HeartOff': return <HeartOff {...iconProps} />;
    case 'Activity': return <Activity {...iconProps} />;
    case 'X': return <X {...iconProps} />;
    case 'CheckCircle2': return <CheckCircle2 {...iconProps} />;
    case 'Feather': return <Feather {...iconProps} />;
    case 'Sliders': return <Sliders {...iconProps} />;
    case 'Volume2': return <Volume2 {...iconProps} />;
    case 'Hourglass': return <Hourglass {...iconProps} />;
    case 'Film': return <Film {...iconProps} />;
    case 'Maximize2': return <Maximize2 {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Sparkle': return <Sparkle {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'Languages': return <Languages {...iconProps} />;
    default: return <Film {...iconProps} />;
  }
};

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({
  currentQuestionIndex,
  surveyData,
  onUpdateSurvey,
  onNextQuestion,
  onPrevQuestion,
  onSkipQuestion,
  onFinishQuestions,
}) => {
  const totalQuestions = QUESTIONS.length;
  const currentQ = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const currentValue = surveyData[currentQ.id] ?? (currentQ.id === 'languagePreference' ? surveyData.language : undefined);

  const handleSelectOption = (value: string) => {
    if (currentQ.multiSelect) {
      const arr = Array.isArray(currentValue) ? [...currentValue] : [];
      if (arr.includes(value)) {
        onUpdateSurvey(currentQ.id, arr.filter((v) => v !== value));
      } else {
        onUpdateSurvey(currentQ.id, [...arr, value]);
      }
    } else {
      onUpdateSurvey(currentQ.id, value);
      // For single-choice, auto-advance with a slight natural delay for visual feedback
      setTimeout(() => {
        if (isLastQuestion) {
          onFinishQuestions();
        } else {
          onNextQuestion();
        }
      }, 200);
    }
  };

  const handleNextClick = () => {
    if (isLastQuestion) {
      onFinishQuestions();
    } else {
      onNextQuestion();
    }
  };

  const isMultiSelectSelected = (val: string) => {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(val);
    }
    return false;
  };

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center">
        {/* Top Progress Bar & Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-[#8D989A] mb-2">
            <button
              id="question-prev-btn"
              onClick={onPrevQuestion}
              className="flex items-center gap-1 font-medium hover:text-[#E5E8E6] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <span className="font-semibold text-[#3DBFC4] uppercase tracking-wider font-cinematic">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <button
              id="question-skip-btn"
              onClick={onSkipQuestion}
              className="font-medium hover:text-[#E5E8E6] transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Progress Bar Track */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1B2329] border border-[#12383B]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#12383B] via-[#3DBFC4] to-[#C65A32] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Animated Question Block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="my-auto"
          >
            {/* Question Heading */}
            <div className="text-center sm:text-left mb-6">
              <h2 className="font-cinema-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#E5E8E6] tracking-tight">
                {currentQ.prompt}
              </h2>
              {currentQ.subtitle && (
                <p className="mt-2 text-sm text-[#8D989A]">
                  {currentQ.subtitle}
                </p>
              )}
            </div>

            {/* Options Grid */}
            <div
              className={`grid gap-3 ${
                currentQ.options.length > 6
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : currentQ.options.length > 4
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {currentQ.options.map((option) => {
                const isSelected = currentQ.multiSelect
                  ? isMultiSelectSelected(option.value)
                  : currentValue === option.value;

                return (
                  <button
                    key={option.value}
                    id={`question-option-${option.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    type="button"
                    onClick={() => handleSelectOption(option.value)}
                    className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#3DBFC4] bg-[#12383B]/80 ring-1 ring-[#3DBFC4]/40 shadow-lg shadow-[#3DBFC4]/20'
                        : 'border-[#12383B] bg-[#11161B]/90 hover:border-[#3DBFC4]/40 hover:bg-[#1B2329]/90'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-2">
                      <div
                        className={`rounded-xl p-2.5 transition-colors ${
                          isSelected
                            ? 'bg-[#3DBFC4] text-neutral-950 font-bold'
                            : 'bg-[#1B2329] text-[#3DBFC4] border border-[#12383B] group-hover:bg-[#12383B]'
                        }`}
                      >
                        {renderIcon(option.iconName)}
                      </div>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3DBFC4] text-neutral-950">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <span className="font-medium text-sm sm:text-base text-[#E5E8E6]">
                      {option.label}
                    </span>

                    {option.description && (
                      <span className="mt-1 text-xs text-[#8D989A] line-clamp-2">
                        {option.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions for Multi-Select or Next Manual Advance */}
        <div className="mt-8 flex items-center justify-between border-t border-[#12383B]/60 pt-6">
          <button
            id="question-back-bottom-btn"
            onClick={onPrevQuestion}
            className="text-xs font-medium text-[#8D989A] hover:text-[#E5E8E6] transition-colors"
          >
            ← Previous Question
          </button>

          <button
            id="question-next-btn"
            onClick={handleNextClick}
            className="flex items-center gap-2 rounded-xl bg-[#C65A32] hover:bg-[#8F3F28] px-6 py-3 text-xs sm:text-sm font-semibold text-[#E5E8E6] shadow-md shadow-[#8F3F28]/40 transition-all hover:scale-[1.01] active:scale-[0.99] font-cinematic uppercase tracking-wider cursor-pointer"
          >
            <span>{isLastQuestion ? 'Find My Movies' : 'Continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
