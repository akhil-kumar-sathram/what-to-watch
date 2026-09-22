import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090c] text-[#e5e7eb] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-amber-400 mb-3 font-cinematic">404</h2>
      <p className="text-zinc-400 mb-6">Page not found</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition border border-zinc-700"
      >
        Return Home
      </Link>
    </div>
  );
}
