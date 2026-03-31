import { ImageDown, Layers, Grid3X3, Images } from 'lucide-react';
import { ToolCard } from './components/home';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Pict</h1>
        <p className="text-neutral-500">Select a utility to start</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <ToolCard
          href="/compress"
          icon={<ImageDown size={40} />}
          title="Web Optimizer"
          description="Reduce file size aggressively."
          accentColor="indigo"
        />

        <ToolCard
          href="/batch"
          icon={<Images size={40} />}
          title="Batch Optimizer"
          description="Compress multiple images at once."
          accentColor="pink"
        />

        <ToolCard
          href="/godot"
          icon={<Grid3X3 size={40} />}
          title="Assets Resizer"
          description="Force exact dimensions for tiles/sprites."
          accentColor="orange"
        />

        <ToolCard
          href="/remove-bg"
          icon={<Layers size={40} />}
          title="Remove Background"
          description="Clean logos or items using local AI."
          accentColor="emerald"
        />
      </div>
    </main>
  );
}
