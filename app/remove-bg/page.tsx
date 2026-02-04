'use client';

import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { Layers, Loader2, Image as ImageIcon } from 'lucide-react';

import { PageHeader, DropZone, ActionBar } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { PreviewBackground } from '../types';

const TRANSPARENCY_GRID_URL = "https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0";

export default function RemoveBgPage() {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewBg, setPreviewBg] = useState<PreviewBackground>('transparent');

  // Core AI Logic
  const processImage = async (inputFile: File) => {
    setIsProcessing(true);
    setProcessedImage(null);

    try {
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

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload(processImage);

  const handleDiscard = () => {
    clearFile();
    setProcessedImage(null);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Background Remover (AI)" accentColor="emerald" />

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
            {!file && !isProcessing && (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Upload Image to Remove Background"
                inputId="bg-upload"
                accentColor="emerald"
              />
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
                    <div 
                      className="absolute inset-0"
                      style={previewBg === 'transparent' ? {
                        backgroundImage: `url('${TRANSPARENCY_GRID_URL}')`,
                        backgroundRepeat: 'repeat',
                        opacity: 0.5
                      } : {
                        backgroundColor: previewBg === 'white' ? 'white' : 'black'
                      }}
                    ></div>

                    {/* Image Layer */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={processedImage} alt="Removed Background" className="relative z-10 max-h-[500px] object-contain" />
                 </div>

                 {/* Action Bar */}
                 <ActionBar
                   downloadUrl={processedImage}
                   downloadName={`nobg_${file?.name.split('.')[0]}.png`}
                   onDiscard={handleDiscard}
                   accentColor="emerald"
                 >
                   <ImageIcon className="text-emerald-400" />
                   <span className="text-sm text-white">{file?.name}</span>
                 </ActionBar>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
