'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Settings2, Link as LinkIcon, Unlock, Trash2 } from 'lucide-react';

export default function GodotPage() {
  // --- STATE ---
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  // --- SETTINGS ---
  const [format, setFormat] = useState<string>('image/webp');
  // Godot specific: Default to 70x70 as you requested
  const [width, setWidth] = useState<number>(70);
  const [height, setHeight] = useState<number>(70);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(false); // Default false to force square

  // --- LOGIC ---
  const handleFileSelect = async (file: File) => {
    setOriginalFile(file);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setOriginalDimensions({ w: img.width, h: img.height });
      // We do NOT overwrite width/height here because we want to keep your 70x70 preset
    };
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileSelect(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (maintainAspect && originalDimensions.w > 0) {
      const ratio = originalDimensions.h / originalDimensions.w;
      setHeight(Math.round(newW * ratio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (maintainAspect && originalDimensions.h > 0) {
      const ratio = originalDimensions.w / originalDimensions.h;
      setWidth(Math.round(newH * ratio));
    }
  };

  const processImage = useCallback(async () => {
    if (!originalFile || width === 0 || height === 0) return;

    try {
      const imgBitmap = await createImageBitmap(originalFile);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Godot often likes Pixel Art crispness
      ctx.imageSmoothingEnabled = false; 

      ctx.drawImage(imgBitmap, 0, 0, width, height);

      canvas.toBlob((blob) => {
          if (blob) {
            setCompressedFile(blob);
            setCompressedUrl(URL.createObjectURL(blob));
          }
        },
        format,
        0.9 // High quality for assets
      );
    } catch (error) {
      console.error(error);
    }
  }, [originalFile, width, height, format]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (originalFile) processImage();
    }, 300);
    return () => clearTimeout(timer);
  }, [width, height, format, originalFile, processImage]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-orange-400">Asset Resizer</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg space-y-6">
              <div className="flex items-center gap-2 text-orange-400 border-b border-neutral-800 pb-4">
                <Settings2 size={20} />
                <h2 className="font-semibold">Grid Settings</h2>
              </div>

              {/* Dimensions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-neutral-400">Target Size (px)</label>
                  <button 
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded border ${maintainAspect ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-neutral-700 text-neutral-500'}`}
                  >
                    {maintainAspect ? <LinkIcon size={12}/> : <Unlock size={12}/>}
                    {maintainAspect ? 'Linked' : 'Free (Force)'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none" />
                  <span className="text-neutral-600">x</span>
                  <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none" />
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none">
                  <option value="image/webp">WebP (Recommended)</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-8">
            {!originalFile ? (
              <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="h-96 border-2 border-dashed border-neutral-800 hover:border-orange-500 bg-neutral-900/50 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer relative">
                <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload size={32} className="text-neutral-400" />
                <p className="text-neutral-300">Drop Godot Asset</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                   <div className="text-sm">
                      <p className="text-white">{originalFile.name}</p>
                      <p className="text-neutral-500">{originalDimensions.w}x{originalDimensions.h} → <span className="text-orange-400 font-bold">{width}x{height}</span></p>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => { setOriginalFile(null); setCompressedFile(null); setCompressedUrl(null); }}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Discard"
                      >
                        <Trash2 size={20} />
                      </button>
                      {compressedUrl && (
                        <a href={compressedUrl} download={`godot_${originalFile.name}`} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
                          <Download size={16}/> Download
                        </a>
                      )}
                   </div>
                </div>
                {compressedUrl && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden p-4 flex items-center justify-center">
                    {/* Explicitly using pixelated rendering style for game assets */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={compressedUrl} alt="Preview" style={{ imageRendering: 'pixelated' }} className="max-h-[400px] border border-neutral-800 bg-[url('https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0')] bg-repeat" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}