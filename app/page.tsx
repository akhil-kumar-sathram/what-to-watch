'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
