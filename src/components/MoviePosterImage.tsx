'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Film } from 'lucide-react';

interface MoviePosterImageProps {
  src?: string | null;
  altTitle?: string;
  title?: string;
  className?: string;
  imageClassName?: string;
  aspectRatio?: string;
  priority?: boolean;
  onClick?: () => void;
  showBadge?: boolean;
}

/**
 * MoviePosterImage enforces strict TMDB poster verification and resilient failure handling.
 * 
 * Requirements satisfied:
 * - Only uses verified TMDB CDN URLs (image.tmdb.org/t/p/)
 * - Never generates AI artwork, never uses Unsplash/Pexels, never shows random web images
 * - Uses next/image with proper fill, aspect ratio, object-fit, referrerPolicy, and sizes
 * - Displays a clean, neutral "Poster unavailable" fallback on failure or missing poster
 * - Proper alt text: "${altTitle} official movie poster"
 * - Keeps movie information visible without broken image icons
 */
export const MoviePosterImage: React.FC<MoviePosterImageProps> = ({
  src,
  altTitle,
  title,
  className = '',
  imageClassName = '',
  aspectRatio = 'aspect-[2/3]',
  priority = false,
  onClick,
  showBadge = false,
}) => {
  const displayTitle = altTitle || title || 'Movie';
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Validate that the source is strictly from TMDB's official image CDN
  const isValidTmdbUrl =
    Boolean(src) &&
    typeof src === 'string' &&
    src.startsWith('https://image.tmdb.org/t/p/') &&
    !hasError;

  if (!isValidTmdbUrl) {
    return (
      <div
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-neutral-900/90 border border-white/10 text-neutral-400 p-4 text-center select-none ${aspectRatio} ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-2 max-w-[85%]">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neutral-400">
            <Film className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.5]" />
          </div>
          <p className="line-clamp-2 text-xs sm:text-sm font-semibold text-neutral-200 tracking-tight">
            {displayTitle}
          </p>
          <span className="text-[10px] sm:text-xs text-neutral-400 font-medium">
            Poster unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-neutral-900 ${aspectRatio} ${className}`}
    >
      {/* Background loading skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800/80" />
      )}

      {/* Official TMDB verified poster via next/image */}
      <Image
        src={src!}
        alt={`${displayTitle} official movie poster`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
      />

      {showBadge && isLoaded && (
        <div className="absolute bottom-2 left-2 z-10 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-amber-300 uppercase backdrop-blur-md border border-white/10">
          TMDB Verified
        </div>
      )}
    </div>
  );
};
