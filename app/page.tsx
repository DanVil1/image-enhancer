import Link from 'next/link';
import { ImageDown, Layers, Grid3X3 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Image Enhancer</h1>
        <p className="text-neutral-500">Select a utility to start</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* Tool 1: General Compressor */}
        <Link 
          href="/compress"
          className="group border border-neutral-800 bg-neutral-900 p-8 rounded-2xl hover:border-indigo-500 hover:bg-neutral-800/50 transition-all cursor-pointer flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors">
            <ImageDown size={40} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-200">Web Optimizer</h2>
            <p className="text-sm text-neutral-400 mt-2">Reduce file size aggressively.</p>
          </div>
        </Link>

        {/* Tool 2: Godot Resizer (NEW) */}
        <Link 
          href="/godot"
          className="group border border-neutral-800 bg-neutral-900 p-8 rounded-2xl hover:border-orange-500 hover:bg-neutral-800/50 transition-all cursor-pointer flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-orange-500/10 rounded-full group-hover:bg-orange-500/20 transition-colors">
            <Grid3X3 size={40} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-200">Assets Resizer</h2>
            <p className="text-sm text-neutral-400 mt-2">Force exact dimensions (e.g., 70x70) for tiles/sprites.</p>
          </div>
        </Link>

        {/* Tool 3: Background Remover */}
        <Link 
          href="/remove-bg"
          className="group border border-neutral-800 bg-neutral-900 p-8 rounded-2xl hover:border-emerald-500 hover:bg-neutral-800/50 transition-all cursor-pointer flex flex-col items-center text-center gap-4"
        >
          <div className="p-4 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
            <Layers size={40} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-200">Remove Background</h2>
            <p className="text-sm text-neutral-400 mt-2">Clean logos or items using local AI.</p>
          </div>
        </Link>

      </div>
    </main>
  );
}