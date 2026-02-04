'use client';

import { useState, useEffect, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { FileImage, Download } from 'lucide-react';

import { PageHeader, DropZone, ImagePreview, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize, generateDownloadName } from '../lib/image';
import { CompressionSettings } from '../types';

export default function CompressPage() {
  // Processed state
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  // Settings State
  const [quality, setQuality] = useState<number>(0.7);
  const [format, setFormat] = useState<string>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number>(1920);

  // Core Compression Logic
  const handleCompression = useCallback(async (file: File) => {
    const options: CompressionSettings = {
      maxSizeMB: 1, 
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: format,
      initialQuality: quality,
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      const newFileName = generateDownloadName(file.name, 'optimized', format);
      const newFile = new File([compressedBlob], newFileName, { type: format });

      setCompressedFile(newFile);
      setCompressedUrl(URL.createObjectURL(newFile));
    } catch (error) {
      console.error('Compression failed:', error);
    }
  }, [format, maxWidth, quality]);

  const { file: originalFile, handleDrop, handleFileSelect, clearFile } = useImageUpload();

  // Re-run compression when settings change
  useEffect(() => {
    if (originalFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCompression(originalFile);
    }
  }, [quality, format, maxWidth, originalFile, handleCompression]);

  const handleDiscard = () => {
    clearFile();
    setCompressedFile(null);
    setCompressedUrl(null);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Image Optimizer" accentColor="indigo" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Configuration" accentColor="indigo">
              {/* Format Selector */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Output Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="image/webp">WebP (Best for Web)</option>
                  <option value="image/jpeg">JPEG (Standard)</option>
                  <option value="image/png">PNG (Lossless/Heavy)</option>
                </select>
              </div>

              {/* Quality Slider */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">Quality</label>
                  <span className="text-indigo-400">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1" step="0.1" 
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-neutral-600 mt-2">Lower quality = smaller file size.</p>
              </div>

              {/* Max Width */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Max Width (px)</label>
                <input 
                  type="number" 
                  value={maxWidth} 
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-neutral-600 mt-2">Resizes large images (4K+) to save space.</p>
              </div>
            </SettingsPanel>
          </div>

          {/* RIGHT COLUMN: Workspace */}
          <div className="lg:col-span-8">
            
            {/* Drop Zone */}
            {!originalFile ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drag & Drop or Click to Upload"
                sublabel="Supports JPG, PNG, WEBP"
                accentColor="indigo"
              />
            ) : (
              // Results View
              <div className="space-y-6">
                
                {/* Stats Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="bg-neutral-800 p-3 rounded-lg">
                        <FileImage className="text-indigo-400" size={24}/>
                      </div>
                      <div>
                        <p className="text-white font-medium truncate max-w-[200px]">{originalFile.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-500 line-through">{formatFileSize(originalFile.size)}</span>
                          <span className="text-neutral-500">→</span>
                          {compressedFile ? (
                            <span className="text-emerald-400 font-bold">{formatFileSize(compressedFile.size)}</span>
                          ) : (
                            <span className="animate-pulse text-indigo-400">Compressing...</span>
                          )}
                        </div>
                      </div>
                   </div>

                   {compressedUrl && compressedFile && (
                     <div className="flex gap-3">
                        <button 
                          onClick={handleDiscard}
                          className="px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          New
                        </button>
                        <a 
                          href={compressedUrl} 
                          download={compressedFile.name}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          <Download size={18} /> Download
                        </a>
                     </div>
                   )}
                </div>

                {/* Preview Image */}
                {compressedUrl && (
                  <ImagePreview src={compressedUrl} alt="Compressed Preview" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
