import Link from 'next/link';

export const metadata = {
  title: 'Knowledge Campus — Learn AI by Exploring',
  description: 'A Pokémon-style spatial campus where you learn practical AI skills by walking, discovering, and building.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-2">
          <div className="text-6xl">🏫</div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Knowledge Campus
          </h1>
          <p className="text-lg text-slate-500">
            Learn AI by exploring a spatial campus
          </p>
        </div>

        {/* Description */}
        <p className="text-slate-600 leading-relaxed">
          Walk through rooms, discover interactive stations, and build practical AI skills.
          Pokémon-style exploration meets real-world learning.
        </p>

        {/* CTA */}
        <Link
          href="/campus"
          className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-8 py-3.5 text-white font-medium hover:bg-slate-700 transition shadow-lg shadow-slate-800/20"
        >
          Enter the Campus →
        </Link>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-500">
          <div className="space-y-1">
            <div className="text-2xl">🧭</div>
            <p>Explore rooms</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🤖</div>
            <p>Learn AI skills</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔨</div>
            <p>Build & apply</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400">
          Built with Next.js + Phaser · Works in any browser
        </p>
      </div>
    </main>
  );
}
