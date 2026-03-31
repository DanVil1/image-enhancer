import { 
  ImageDown, 
  Layers, 
  Grid3X3, 
  Images, 
  RefreshCw, 
  ShieldOff, 
  Crop, 
  AppWindow, 
  Code, 
  Palette, 
  EyeOff 
} from 'lucide-react';
import { ToolCard } from './components/home';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Pict</h1>
        <p className="text-neutral-500">Select a utility to start</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
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

        <ToolCard
          href="/convert"
          icon={<RefreshCw size={40} />}
          title="Format Converter"
          description="Convert between PNG, JPG, WebP."
          accentColor="cyan"
        />

        <ToolCard
          href="/metadata"
          icon={<ShieldOff size={40} />}
          title="Metadata Stripper"
          description="Remove EXIF data for privacy."
          accentColor="red"
        />

        <ToolCard
          href="/crop"
          icon={<Crop size={40} />}
          title="Image Cropper"
          description="Crop with preset aspect ratios."
          accentColor="violet"
        />

        <ToolCard
          href="/favicon"
          icon={<AppWindow size={40} />}
          title="Favicon Generator"
          description="Generate all favicon sizes."
          accentColor="amber"
        />

        <ToolCard
          href="/base64"
          icon={<Code size={40} />}
          title="Image to Base64"
          description="Convert images to data URLs."
          accentColor="sky"
        />

        <ToolCard
          href="/palette"
          icon={<Palette size={40} />}
          title="Color Palette"
          description="Extract dominant colors."
          accentColor="teal"
        />

        <ToolCard
          href="/blur"
          icon={<EyeOff size={40} />}
          title="Blur / Pixelate"
          description="Censor sensitive areas."
          accentColor="slate"
        />
      </div>
    </main>
  );
}
