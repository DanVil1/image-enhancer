'use client';

import { useState } from 'react';
import Link from 'next/link';
// FIX: Use named import with brackets { }
import { removeBackground } from '@imgly/background-removal';
import { ArrowLeft, Upload, Download, Layers, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function RemoveBgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBg, setPreviewBg] = useState<'transparent' | 'white' | 'black'>('transparent');

  // Core AI Logic
  const processImage = async (inputFile: File) => {
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      // FIX: Call the named function removeBackground()
      const blob = await removeBackground(inputFile);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to remove background. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      processImage(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processImage(selectedFile);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-emerald-400">Background Remover (AI)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Instructions & Settings */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                  <Layers size={20} />
                  <h2 className="font-semibold">Preview Settings</h2>
                </div>
                <p className="text-sm text-neutral-400 mb-6">
                  Select a background color to verify the transparency edges. This does not affect the downloaded file.
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setPreviewBg('transparent')}
                    className={`flex-1 py-2 rounded border text-sm ${previewBg === 'transparent' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-neutral-700 bg-neutral-800 text-neutral-400'}`}
                  >
                    Grid
                  </button>
                  <button 
                    onClick={() => setPreviewBg('white')}
                    className={`flex-1 py-2 rounded border text-sm ${previewBg === 'white' ? 'border-white bg-white text-black' : 'border-neutral-700 bg-neutral-800 text-neutral-400'}`}
                  >
                    White
                  </button>
                  <button 
                    onClick={() => setPreviewBg('black')}
                    className={`flex-1 py-2 rounded border text-sm ${previewBg === 'black' ? 'border-black bg-black text-white' : 'border-neutral-700 bg-neutral-800 text-neutral-400'}`}
                  >
                    Black
                  </button>
                </div>
             </div>

             <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-500">
                <p><strong>Note:</strong> The first time you use this, it will download the AI model (~40MB). Subsequent uses will be instant.</p>
             </div>
          </div>

          {/* RIGHT: Workspace */}
          <div className="lg:col-span-8">
            
            {/* 1. Upload State */}
            {!file && (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="h-96 border-2 border-dashed border-neutral-800 hover:border-emerald-500 bg-neutral-900/50 hover:bg-neutral-900 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group"
              >
                <input type="file" onChange={handleFileSelect} className="hidden" id="bg-upload" accept="image/*" />
                <label htmlFor="bg-upload" className="flex flex-col items-center cursor-pointer">
                  <div className="p-5 bg-neutral-800 rounded-full group-hover:scale-110 transition-transform mb-4">
                    <Upload size={32} className="text-neutral-400 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-300">Upload Image to Remove Background</p>
                </label>
              </div>
            )}

            {/* 2. Processing State */}
            {isProcessing && (
              <div className="h-96 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-4">
                 <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                 <p className="text-neutral-400 animate-pulse">Running AI Model locally...</p>
              </div>
            )}

            {/* 3. Result State */}
            {!isProcessing && processedImage && (
              <div className="space-y-6">
                 {/* Preview Container */}
                 <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative flex items-center justify-center min-h-[400px]">
                    {/* Background Layer */}
                    <div className={`absolute inset-0 ${
                      previewBg === 'transparent' 
                      ? "bg-[url('https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0')] bg-repeat opacity-50" 
                      : previewBg === 'white' ? 'bg-white' : 'bg-black'
                    }`}></div>

                    {/* Image Layer */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={processedImage} alt="Removed Background" className="relative z-10 max-h-[500px] object-contain" />
                 </div>

                 {/* Action Bar */}
                 <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                       <ImageIcon className="text-emerald-400" />
                       <span className="text-sm text-white">{file?.name}</span>
                    </div>

                    <div className="flex gap-3">
                       <button 
                         onClick={() => { setFile(null); setProcessedImage(null); }}
                         className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                         title="Discard"
                       >
                         <Trash2 size={20} />
                       </button>
                       <a 
                         href={processedImage} 
                         download={`nobg_${file?.name.split('.')[0]}.png`}
                         className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium flex gap-2 items-center"
                       >
                         <Download size={16}/> Download PNG
                       </a>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}