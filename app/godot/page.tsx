'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link as LinkIcon, Unlock } from 'lucide-react';

import { PageHeader, DropZone, ActionBar, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { getImageDimensions, generateDownloadName } from '../lib/image';
import { ImageDimensions } from '../types';

const TRANSPARENCY_GRID_URL = "https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0";

export default function GodotPage() {
  // --- STATE ---
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ w: 0, h: 0 });
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  // --- SETTINGS ---
  const [format, setFormat] = useState<string>('image/webp');
  const [width, setWidth] = useState<number>(70);
  const [height, setHeight] = useState<number>(70);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(false);

  // Handle file selection with dimensions
  const handleFileSelected = async (file: File) => {
    const dimensions = await getImageDimensions(file);
    setOriginalDimensions(dimensions);
  };

  const { file: originalFile, handleDrop, handleFileSelect, clearFile } = useImageUpload(handleFileSelected);

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

      ctx.imageSmoothingEnabled = false; 
      ctx.drawImage(imgBitmap, 0, 0, width, height);

      canvas.toBlob((blob) => {
          if (blob) {
            setCompressedUrl(URL.createObjectURL(blob));
          }
        },
        format,
        0.9
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

  const handleDiscard = () => {
    clearFile();
    setCompressedUrl(null);
    setOriginalDimensions({ w: 0, h: 0 });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Asset Resizer" accentColor="orange" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Grid Settings" accentColor="orange">
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
            </SettingsPanel>
          </div>

          {/* Preview */}
          <div className="lg:col-span-8">
            {!originalFile ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Godot Asset"
                sublabel="Supports JPG, PNG, WEBP"
                accentColor="orange"
              />
            ) : (
              <div className="space-y-6">
                <ActionBar
                  downloadUrl={compressedUrl || ''}
                  downloadName={generateDownloadName(originalFile.name, 'godot', format)}
                  onDiscard={handleDiscard}
                  accentColor="orange"
                >
                  <div className="text-sm">
                    <p className="text-white">{originalFile.name}</p>
                    <p className="text-neutral-500">
                      {originalDimensions.w}x{originalDimensions.h} → 
                      <span className="text-orange-400 font-bold ml-1">{width}x{height}</span>
                    </p>
                  </div>
                </ActionBar>

                {compressedUrl && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden p-4 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={compressedUrl} 
                      alt="Preview" 
                      style={{ 
                        imageRendering: 'pixelated',
                        backgroundImage: `url('${TRANSPARENCY_GRID_URL}')`,
                        backgroundRepeat: 'repeat'
                      }} 
                      className="max-h-[400px] border border-neutral-800" 
                    />
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
