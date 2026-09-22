'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08090c] text-[#e5e7eb] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-amber-400 mb-4 font-cinematic">
        Something went wrong
      </h2>
      <p className="text-zinc-400 max-w-md mb-6">
        An unexpected error occurred while loading your recommendations.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition"
      >
        Try Again
      </button>
    </div>
  );
}
