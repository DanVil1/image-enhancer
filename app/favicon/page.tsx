'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Download, Package } from 'lucide-react';

import { PageHeader, DropZone } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';

interface FaviconSize {
  size: number;
  name: string;
  description: string;
}

const FAVICON_SIZES: FaviconSize[] = [
  { size: 16, name: 'favicon-16x16.png', description: 'Browser tab (small)' },
  { size: 32, name: 'favicon-32x32.png', description: 'Browser tab (standard)' },
  { size: 48, name: 'favicon-48x48.png', description: 'Windows site icons' },
  { size: 64, name: 'favicon-64x64.png', description: 'Windows site icons (HD)' },
  { size: 96, name: 'favicon-96x96.png', description: 'Google TV' },
  { size: 128, name: 'favicon-128x128.png', description: 'Chrome Web Store' },
  { size: 180, name: 'apple-touch-icon.png', description: 'Apple Touch Icon' },
  { size: 192, name: 'android-chrome-192x192.png', description: 'Android Chrome' },
  { size: 512, name: 'android-chrome-512x512.png', description: 'Android Chrome (HD)' },
];

interface GeneratedFavicon {
  size: number;
  name: string;
  url: string;
  blob: Blob;
}

export default function FaviconPage() {
  const [favicons, setFavicons] = useState<GeneratedFavicon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateFavicons = useCallback(async (file: File) => {
    setIsGenerating(true);
    setFavicons([]);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => { img.onload = resolve; });

    const generated: GeneratedFavicon[] = [];

    for (const { size, name } of FAVICON_SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) continue;

      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, size, size);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      generated.push({
        size,
        name,
        url: URL.createObjectURL(blob),
        blob,
      });
    }

    URL.revokeObjectURL(img.src);
    setFavicons(generated);
    setIsGenerating(false);
  }, []);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload(generateFavicons);

  const downloadAll = async () => {
    const zip = new JSZip();
    
    for (const favicon of favicons) {
      zip.file(favicon.name, favicon.blob);
    }

    // Add HTML snippet
    const htmlSnippet = `<!-- Favicon HTML -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
    
    zip.file('favicon-snippet.html', htmlSnippet);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicons.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDiscard = () => {
    favicons.forEach(f => URL.revokeObjectURL(f.url));
    clearFile();
    setFavicons([]);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Favicon Generator" accentColor="amber" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <Package size={20} />
                <h2 className="font-semibold">Generated Sizes</h2>
              </div>
              <div className="space-y-2 text-sm">
                {FAVICON_SIZES.map(({ size, description }) => (
                  <div key={size} className="flex justify-between text-neutral-400">
                    <span>{size}×{size}</span>
                    <span className="text-neutral-600">{description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm text-amber-400">
              <strong>Tip:</strong> Use a square image (1:1 ratio) for best results. Recommended minimum size: 512×512px.
            </div>

            {favicons.length > 0 && (
              <button
                onClick={downloadAll}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Download size={18} />
                Download All ({favicons.length} files)
              </button>
            )}
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Logo or Icon"
                sublabel="Square image works best (512×512+)"
                accentColor="amber"
              />
            ) : (
              <div className="space-y-6">
                {/* Loading State */}
                {isGenerating && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                    <div className="animate-pulse text-amber-400 mb-2">Generating favicons...</div>
                    <p className="text-sm text-neutral-500">Creating {FAVICON_SIZES.length} sizes</p>
                  </div>
                )}

                {/* Generated Favicons Grid */}
                {favicons.length > 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-neutral-400 mb-4">Generated Favicons</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      {favicons.map((favicon) => (
                        <div key={favicon.size} className="flex flex-col items-center gap-2">
                          <div className="bg-neutral-800 p-2 rounded-lg flex items-center justify-center" style={{ minHeight: '80px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={favicon.url} 
                              alt={`${favicon.size}x${favicon.size}`}
                              style={{ width: Math.min(favicon.size, 64), height: Math.min(favicon.size, 64) }}
                              className="object-contain"
                            />
                          </div>
                          <span className="text-xs text-neutral-500">{favicon.size}×{favicon.size}</span>
                          <a
                            href={favicon.url}
                            download={favicon.name}
                            className="text-xs text-amber-400 hover:text-amber-300"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    New Image
                  </button>
                  
                  {favicons.length > 0 && (
                    <button
                      onClick={downloadAll}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Download size={18} />
                      Download ZIP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
