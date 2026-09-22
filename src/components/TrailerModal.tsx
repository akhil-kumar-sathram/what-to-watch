'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Movie } from '../types';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[#12383B] bg-[#11161B] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#12383B]/60 px-6 py-4">
          <div>
            <span className="font-cinematic text-xs uppercase tracking-[0.16em] text-[#3DBFC4] font-semibold">
              Official Trailer
            </span>
            <h3 className="font-movie-title text-base sm:text-lg font-bold text-[#E5E8E6] tracking-[0.08em] uppercase">
              {movie.title} <span className="font-sans font-normal text-xs text-[#8D989A]">({movie.year})</span>
            </h3>
          </div>
          <button
            id="trailer-modal-close-btn"
            onClick={onClose}
            className="rounded-full p-2 text-[#8D989A] hover:bg-[#12383B]/50 hover:text-[#E5E8E6] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId}?autoplay=1&rel=0`}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#1B2329]/90 text-xs text-[#8D989A]">
          <span>Directed by {movie.director} · {movie.runtime}</span>
          <a
            href={`https://www.youtube.com/watch?v=${movie.trailerYoutubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#3DBFC4] hover:text-[#68E1E5] transition-colors font-medium"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
