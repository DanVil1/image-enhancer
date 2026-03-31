'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Palette } from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  count: number;
  percentage: number;
}

export default function PalettePage() {
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [colorCount, setColorCount] = useState<number>(6);
  const [copied, setCopied] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const extractColors = useCallback(async (file: File) => {
    setIsExtracting(true);
    setColors([]);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale down for performance
    const maxSize = 100;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Count colors (quantize to reduce variations)
    const colorMap = new Map<string, number>();
    const quantize = 24; // Reduce color space
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = Math.round(pixels[i] / quantize) * quantize;
      const g = Math.round(pixels[i + 1] / quantize) * quantize;
      const b = Math.round(pixels[i + 2] / quantize) * quantize;
      const a = pixels[i + 3];
      
      if (a < 128) continue; // Skip transparent pixels
      
      const key = `${r},${g},${b}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency and get top colors
    const totalPixels = pixels.length / 4;
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([key, count]): ExtractedColor => {
        const [r, g, b] = key.split(',').map(Number);
        return {
          hex: rgbToHex(r, g, b),
          rgb: { r, g, b },
          count,
          percentage: Math.round((count / totalPixels) * 100),
        };
      });

    URL.revokeObjectURL(img.src);
    setColors(sortedColors);
    setIsExtracting(false);
  }, [colorCount]);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload(extractColors);

  const copyColor = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleDiscard = () => {
    clearFile();
    setColors([]);
  };

  const copyCSSVariables = () => {
    const css = colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    const fullCss = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(fullCss);
    setCopied('css');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Color Palette Extractor" accentColor="teal" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Panel */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Extraction Settings" accentColor="teal">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">Number of Colors</label>
                  <span className="text-teal-400">{colorCount}</span>
                </div>
                <input 
                  type="range" min="3" max="12" step="1" 
                  value={colorCount} 
                  onChange={(e) => {
                    setColorCount(parseInt(e.target.value));
                    if (file) extractColors(file);
                  }}
                  className="w-full accent-teal-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {colors.length > 0 && (
                <button
                  onClick={copyCSSVariables}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {copied === 'css' ? <Check size={18} /> : <Copy size={18} />}
                  {copied === 'css' ? 'Copied!' : 'Copy as CSS Variables'}
                </button>
              )}
            </SettingsPanel>

            <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl text-sm text-teal-400">
              <strong>Use Cases:</strong>
              <ul className="mt-2 text-teal-300/80 space-y-1">
                <li>• Design system color inspiration</li>
                <li>• Match brand colors from logos</li>
                <li>• Create cohesive themes</li>
                <li>• Analyze color distribution</li>
              </ul>
            </div>
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Extract Colors"
                sublabel="Works best with logos, art, and photos"
                accentColor="teal"
              />
            ) : (
              <div className="space-y-6">
                {/* Original Image Preview */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Source" 
                      className="max-h-[200px] object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {isExtracting && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                    <div className="animate-pulse text-teal-400 mb-2">Extracting colors...</div>
                  </div>
                )}

                {/* Extracted Colors */}
                {colors.length > 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette size={18} className="text-teal-400" />
                      <h3 className="text-sm font-medium text-neutral-400">Extracted Palette</h3>
                    </div>

                    {/* Color Swatches */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
                      {colors.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => copyColor(color.hex)}
                          className="group flex flex-col items-center gap-2"
                        >
                          <div 
                            className="w-full aspect-square rounded-xl shadow-lg group-hover:scale-105 transition-transform relative"
                            style={{ backgroundColor: color.hex }}
                          >
                            {copied === color.hex && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                <Check size={20} className="text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-neutral-400 font-mono uppercase">{color.hex}</span>
                          <span className="text-xs text-neutral-600">{color.percentage}%</span>
                        </button>
                      ))}
                    </div>

                    {/* Palette Bar */}
                    <div className="h-12 rounded-lg overflow-hidden flex">
                      {colors.map((color) => (
                        <div
                          key={color.hex}
                          className="h-full"
                          style={{ 
                            backgroundColor: color.hex,
                            flex: color.percentage,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Color List */}
                {colors.length > 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    {colors.map((color) => (
                      <div 
                        key={color.hex}
                        className="flex items-center gap-4 p-4 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg shadow"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-mono text-white">{color.hex}</p>
                          <p className="text-xs text-neutral-500">
                            RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                          </p>
                        </div>
                        <div className="text-sm text-neutral-500">{color.percentage}%</div>
                        <button
                          onClick={() => copyColor(color.hex)}
                          className="p-2 text-neutral-400 hover:text-teal-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          {copied === color.hex ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-start bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
