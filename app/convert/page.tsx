'use client';

import { useState, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize, getExtensionFromMime } from '../lib/image';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export default function ConvertPage() {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.92);

  const convertImage = useCallback(async (file: File, format: OutputFormat) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // For PNG transparency, don't fill background
    if (format !== 'image/png') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setConvertedBlob(blob);
          setConvertedUrl(URL.createObjectURL(blob));
        }
      },
      format,
      format === 'image/png' ? undefined : quality
    );

    URL.revokeObjectURL(img.src);
  }, [quality]);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload();

  // Convert when file or format changes
  const handleConvert = useCallback(() => {
    if (file) {
      convertImage(file, outputFormat);
    }
  }, [file, outputFormat, convertImage]);

  const handleDiscard = () => {
    clearFile();
    setConvertedUrl(null);
    setConvertedBlob(null);
  };

  const getDownloadName = () => {
    if (!file) return 'converted';
    const baseName = file.name.split('.')[0];
    const ext = getExtensionFromMime(outputFormat);
    return `${baseName}.${ext}`;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Format Converter" accentColor="cyan" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Output Format" accentColor="cyan">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Convert To</label>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="image/png">PNG (Lossless, supports transparency)</option>
                  <option value="image/jpeg">JPEG (Smaller, no transparency)</option>
                  <option value="image/webp">WebP (Modern, best compression)</option>
                </select>
              </div>

              {outputFormat !== 'image/png' && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-neutral-400">Quality</label>
                    <span className="text-cyan-400">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="1" step="0.05" 
                    value={quality} 
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {file && (
                <button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={18} />
                  Convert
                </button>
              )}
            </SettingsPanel>

            {file && (
              <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-sm">
                <p className="text-neutral-400">Original: <span className="text-white">{file.name}</span></p>
                <p className="text-neutral-400">Size: <span className="text-white">{formatFileSize(file.size)}</span></p>
                {convertedBlob && (
                  <p className="text-neutral-400 mt-2">Converted: <span className="text-cyan-400">{formatFileSize(convertedBlob.size)}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Convert"
                sublabel="Supports PNG, JPG, WebP"
                accentColor="cyan"
              />
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden p-4">
                  <div className="flex items-center justify-center min-h-[300px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={convertedUrl || URL.createObjectURL(file)} 
                      alt="Preview" 
                      className="max-h-[400px] object-contain"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    New Image
                  </button>
                  
                  {convertedUrl && (
                    <a
                      href={convertedUrl}
                      download={getDownloadName()}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Download size={18} />
                      Download {getExtensionFromMime(outputFormat).toUpperCase()}
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
