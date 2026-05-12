'use client';

import dynamic from 'next/dynamic';

const GamePage = dynamic(
  () => import('@/components/game/GamePageClient').then((m) => m.GamePageClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex items-center justify-center bg-[#f5f0e6]">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🏫</div>
          <p className="text-slate-600 font-medium">Loading Knowledge Campus...</p>
          <p className="text-xs text-slate-400">Get ready to explore</p>
        </div>
      </div>
    ),
  }
);

export default function CampusPage() {
  return <GamePage />;
}
