'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorFallbackProps {
  errorMessage: string;
  onRetry: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md text-center rounded-3xl border border-[#12383B] bg-[#11161B]/95 p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B2329] border border-[#12383B] text-[#3DBFC4]">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h2 className="font-cinema-serif text-2xl font-bold text-[#E5E8E6] tracking-tight mb-2">
          Unable to Generate Recommendations
        </h2>
        <p className="text-sm text-[#8D989A] leading-relaxed mb-6">
          {errorMessage || "We couldn't generate your recommendations right now. Please try again."}
        </p>

        <div className="space-y-3">
          <button
            id="error-retry-btn"
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C65A32] hover:bg-[#8F3F28] px-5 py-3 text-sm font-semibold text-[#E5E8E6] shadow-lg shadow-[#8F3F28]/40 transition-all hover:scale-[1.01] active:scale-[0.99] font-cinematic uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
