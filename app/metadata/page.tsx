'use client';

import { useState, useCallback } from 'react';
import { Download, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

import { PageHeader, DropZone } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize } from '../lib/image';

export default function MetadataPage() {
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stripMetadata = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    ctx.drawImage(img, 0, 0);

    // Determine output format based on input
    const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCleanedBlob(blob);
          setCleanedUrl(URL.createObjectURL(blob));
        }
        setIsProcessing(false);
      },
      format,
      0.95
    );

    URL.revokeObjectURL(img.src);
  }, []);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload(stripMetadata);

  const handleDiscard = () => {
    clearFile();
    setCleanedUrl(null);
    setCleanedBlob(null);
  };

  const getDownloadName = () => {
    if (!file) return 'clean';
    const baseName = file.name.split('.')[0];
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    return `${baseName}_clean.${ext}`;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Metadata Stripper" accentColor="red" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <Shield size={20} />
                <h2 className="font-semibold">Privacy Protection</h2>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Images often contain hidden metadata (EXIF data) that can reveal:
              </p>
              <ul className="text-sm text-neutral-500 space-y-2">
                <li className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  GPS location where photo was taken
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Camera/phone model
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Date and time
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Software used to edit
                </li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm">
              <p className="text-red-400">
                <strong>Tip:</strong> Always strip metadata before uploading photos to social media or sharing online.
              </p>
            </div>
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Clean"
                sublabel="Removes all EXIF/metadata"
                accentColor="red"
              />
            ) : (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {isProcessing ? (
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <Shield size={24} className="text-red-400" />
                      </div>
                    ) : cleanedUrl ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                      </div>
                    ) : null}
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-neutral-500">
                        Original: {formatFileSize(file.size)}
                        {cleanedBlob && (
                          <span className="text-emerald-400 ml-2">
                            → Clean: {formatFileSize(cleanedBlob.size)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {cleanedUrl && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-sm text-emerald-400">
                      ✓ All metadata has been stripped. Image is clean and safe to share.
                    </div>
                  )}
                </div>

                {/* Preview */}
                {cleanedUrl && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden p-4">
                    <div className="flex items-center justify-center min-h-[250px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={cleanedUrl} 
                        alt="Cleaned" 
                        className="max-h-[350px] object-contain"
                      />
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
                  
                  {cleanedUrl && (
                    <a
                      href={cleanedUrl}
                      download={getDownloadName()}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Download size={18} />
                      Download Clean Image
                    </a>
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
