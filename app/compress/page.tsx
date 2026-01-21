'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { ArrowLeft, Upload, Download, RefreshCw, FileImage, Settings2 } from 'lucide-react';

interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType: string;
  initialQuality: number;
}

export default function CompressPage() {
  // State
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Settings State
  const [quality, setQuality] = useState<number>(0.7);
  const [format, setFormat] = useState<string>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number>(1920);

  // Core Compression Logic
  const handleCompression = useCallback(async (file: File) => {
    setIsCompressing(true);
    
    const options: CompressionSettings = {
      maxSizeMB: 1, 
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: format,
      initialQuality: quality,
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      
      const newFileName = `optimized_${file.name.split('.')[0]}.${format.split('/')[1]}`;
      const newFile = new File([compressedBlob], newFileName, { type: format });

      setCompressedFile(newFile);
      setCompressedUrl(URL.createObjectURL(newFile));
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsCompressing(false);
    }
  }, [format, maxWidth, quality]);

  // Re-run compression when settings change
  useEffect(() => {
    if (originalFile) {
      handleCompression(originalFile);
    }
  }, [quality, format, maxWidth, originalFile, handleCompression]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setOriginalFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setOriginalFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-indigo-400">Image Optimizer</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-6 text-indigo-400">
                <Settings2 size={20} />
                <h2 className="font-semibold">Configuration</h2>
              </div>

              {/* Format Selector */}
              <div className="mb-6">
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
              <div className="mb-6">
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
            </div>
          </div>

          {/* RIGHT COLUMN: Workspace */}
          <div className="lg:col-span-8">
            
            {/* Drop Zone */}
            {!originalFile ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="h-96 border-2 border-dashed border-neutral-800 hover:border-indigo-500 bg-neutral-900/50 hover:bg-neutral-900 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  <div className="p-5 bg-neutral-800 rounded-full group-hover:scale-110 transition-transform mb-4">
                    <Upload size={32} className="text-neutral-400 group-hover:text-indigo-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-300">Drag & Drop or Click to Upload</p>
                  <p className="text-sm text-neutral-500 mt-2">Supports JPG, PNG, WEBP</p>
                </label>
              </div>
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
                          <span className="text-neutral-500 line-through">{formatSize(originalFile.size)}</span>
                          <span className="text-neutral-500">→</span>
                          {compressedFile ? (
                            <span className="text-emerald-400 font-bold">{formatSize(compressedFile.size)}</span>
                          ) : (
                            <span className="animate-pulse text-indigo-400">Compressing...</span>
                          )}
                        </div>
                      </div>
                   </div>

                   {compressedUrl && compressedFile && (
                     <div className="flex gap-3">
                        <button 
                          onClick={() => { setOriginalFile(null); setCompressedFile(null); }}
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
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded text-xs text-white backdrop-blur-sm">
                      Preview
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={compressedUrl} 
                      alt="Compressed Preview" 
                      className="w-full h-auto object-contain max-h-[500px] bg-[url('https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0')] bg-repeat"
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