'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Download, EyeOff } from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';

type BlurMode = 'blur' | 'pixelate';

export default function BlurPage() {
  // URL tracking handled by canvas operations
  const [mode, setMode] = useState<BlurMode>('blur');
  const [intensity, setIntensity] = useState<number>(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload();

  // Load image onto canvases
  useEffect(() => {
    if (!file || !canvasRef.current || !originalCanvasRef.current) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current!;
      const originalCanvas = originalCanvasRef.current!;
      
      canvas.width = img.width;
      canvas.height = img.height;
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;
      
      const ctx = canvas.getContext('2d')!;
      const originalCtx = originalCanvas.getContext('2d')!;
      
      ctx.drawImage(img, 0, 0);
      originalCtx.drawImage(img, 0, 0);
      
      setImageLoaded(true);
      URL.revokeObjectURL(img.src);
    };
  }, [file]);

  // Apply blur/pixelate effect at mouse position
  const applyEffect = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    if (!canvas || !originalCanvas) return;

    const ctx = canvas.getContext('2d')!;
    const originalCtx = originalCanvas.getContext('2d')!;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    const radius = brushSize * scaleX;

    // Get region to process
    const regionX = Math.max(0, canvasX - radius);
    const regionY = Math.max(0, canvasY - radius);
    const regionW = Math.min(radius * 2, canvas.width - regionX);
    const regionH = Math.min(radius * 2, canvas.height - regionY);

    if (regionW <= 0 || regionH <= 0) return;

    if (mode === 'pixelate') {
      // Pixelate effect
      const pixelSize = Math.max(2, intensity);
      const imageData = originalCtx.getImageData(regionX, regionY, regionW, regionH);
      const data = imageData.data;

      for (let py = 0; py < regionH; py += pixelSize) {
        for (let px = 0; px < regionW; px += pixelSize) {
          // Check if within brush circle
          const dx = (px + regionX) - canvasX;
          const dy = (py + regionY) - canvasY;
          if (dx * dx + dy * dy > radius * radius) continue;

          // Get average color of pixel block
          let r = 0, g = 0, b = 0, count = 0;
          for (let y2 = py; y2 < Math.min(py + pixelSize, regionH); y2++) {
            for (let x2 = px; x2 < Math.min(px + pixelSize, regionW); x2++) {
              const i = (y2 * regionW + x2) * 4;
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              count++;
            }
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);

          // Fill pixel block
          for (let y2 = py; y2 < Math.min(py + pixelSize, regionH); y2++) {
            for (let x2 = px; x2 < Math.min(px + pixelSize, regionW); x2++) {
              const i = (y2 * regionW + x2) * 4;
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
            }
          }
        }
      }
      ctx.putImageData(imageData, regionX, regionY);
    } else {
      // Gaussian blur using CSS filter (simplified approach)
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      // Draw blurred version
      ctx.filter = `blur(${intensity}px)`;
      ctx.drawImage(originalCanvas, 0, 0);
      ctx.filter = 'none';
      ctx.restore();
    }
  }, [mode, intensity, brushSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    applyEffect(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    applyEffect(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    if (!canvasRef.current || !originalCanvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.drawImage(originalCanvasRef.current, 0, 0);
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `censored_${file?.name || 'image.png'}`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleDiscard = () => {
    clearFile();
    setImageLoaded(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Blur / Pixelate" accentColor="slate" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Censor Settings" accentColor="slate">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Effect Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('blur')}
                    className={`flex-1 py-2 rounded border text-sm transition-colors ${
                      mode === 'blur' 
                        ? 'border-slate-500 bg-slate-500/20 text-slate-300' 
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Blur
                  </button>
                  <button
                    onClick={() => setMode('pixelate')}
                    className={`flex-1 py-2 rounded border text-sm transition-colors ${
                      mode === 'pixelate' 
                        ? 'border-slate-500 bg-slate-500/20 text-slate-300' 
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Pixelate
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">Brush Size</label>
                  <span className="text-slate-400">{brushSize}px</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="5" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-slate-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">Intensity</label>
                  <span className="text-slate-400">{intensity}</span>
                </div>
                <input 
                  type="range" min="2" max="30" step="1" 
                  value={intensity} 
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-slate-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {imageLoaded && (
                <button
                  onClick={resetCanvas}
                  className="w-full py-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors text-sm"
                >
                  Reset Image
                </button>
              )}
            </SettingsPanel>

            <div className="bg-slate-500/10 border border-slate-500/20 p-4 rounded-xl text-sm text-slate-400">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={16} />
                <strong>How to Use</strong>
              </div>
              <ul className="text-slate-400/80 space-y-1">
                <li>• Click and drag to blur/pixelate areas</li>
                <li>• Adjust brush size for precision</li>
                <li>• Use Reset to start over</li>
              </ul>
            </div>
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Censor"
                sublabel="Blur or pixelate sensitive info"
                accentColor="slate"
              />
            ) : (
              <div className="space-y-6">
                {/* Canvas */}
                <div 
                  ref={containerRef}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-auto"
                  />
                  <canvas 
                    ref={originalCanvasRef}
                    className="hidden"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    New Image
                  </button>
                  
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Download size={18} />
                    Download Censored
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
