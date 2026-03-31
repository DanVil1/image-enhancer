'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, Move } from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1 (Square)', value: 1 },
  { label: '16:9 (Widescreen)', value: 16/9 },
  { label: '9:16 (Portrait)', value: 9/16 },
  { label: '4:3 (Standard)', value: 4/3 },
  { label: '3:2 (Photo)', value: 3/2 },
  { label: '2:1 (Panoramic)', value: 2 },
];

export default function CropPage() {
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Using imageRef for cropping instead of canvas
  const containerRef = useRef<HTMLDivElement>(null);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload();

  // Load image and set initial crop
  useEffect(() => {
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // Initial crop area (centered, 80% of image)
      const initialSize = Math.min(img.width, img.height) * 0.8;
      setCropArea({
        x: (img.width - initialSize) / 2,
        y: (img.height - initialSize) / 2,
        width: initialSize,
        height: aspectRatio ? initialSize / aspectRatio : initialSize,
      });
      
      URL.revokeObjectURL(img.src);
    };
  }, [file, aspectRatio]);

  // Update crop area when aspect ratio changes
  useEffect(() => {
    if (aspectRatio && imageSize.width > 0) {
      // Recalculate on next user interaction instead of in effect
    }
  }, [aspectRatio, imageSize, cropArea.width]);

  const handleCrop = useCallback(() => {
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          setCroppedUrl(URL.createObjectURL(blob));
        }
      }, 'image/png');

      URL.revokeObjectURL(img.src);
    };
  }, [file, cropArea]);

  const handleDiscard = () => {
    clearFile();
    setCroppedUrl(null);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  // Mouse handlers for crop box
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    
    let newX = (e.clientX - rect.left) * scaleX - dragStart.x * scaleX;
    let newY = (e.clientY - rect.top) * scaleY - dragStart.y * scaleY;
    
    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, imageSize.width - cropArea.width));
    newY = Math.max(0, Math.min(newY, imageSize.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Image Cropper" accentColor="violet" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Crop Settings" accentColor="violet">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Aspect Ratio</label>
                <select 
                  value={aspectRatio ?? 'free'} 
                  onChange={(e) => setAspectRatio(e.target.value === 'free' ? null : parseFloat(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <option key={ratio.label} value={ratio.value ?? 'free'}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
              </div>

              {file && (
                <>
                  <div className="text-sm text-neutral-400 space-y-1">
                    <p>Original: {imageSize.width} × {imageSize.height}px</p>
                    <p>Crop: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px</p>
                  </div>

                  <button
                    onClick={handleCrop}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Crop Image
                  </button>
                </>
              )}
            </SettingsPanel>

            <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-500">
              <div className="flex items-center gap-2 mb-2">
                <Move size={16} />
                <span className="text-neutral-400">Drag the crop area</span>
              </div>
              <p>Click and drag to reposition the crop box on your image.</p>
            </div>
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Crop"
                sublabel="Draw a crop area on your image"
                accentColor="violet"
              />
            ) : (
              <div className="space-y-6">
                {/* Crop Canvas */}
                <div 
                  ref={containerRef}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative cursor-move"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Original" 
                    className="w-full h-auto opacity-50"
                  />
                  
                  {/* Crop Overlay */}
                  <div
                    className="absolute border-2 border-violet-500 bg-violet-500/10 cursor-move"
                    style={{
                      left: `${(cropArea.x / imageSize.width) * 100}%`,
                      top: `${(cropArea.y / imageSize.height) * 100}%`,
                      width: `${(cropArea.width / imageSize.width) * 100}%`,
                      height: `${(cropArea.height / imageSize.height) * 100}%`,
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-violet-400 text-sm font-medium">
                      {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                    </div>
                  </div>
                </div>

                {/* Cropped Preview */}
                {croppedUrl && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <p className="text-sm text-neutral-400 mb-3">Cropped Result:</p>
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={croppedUrl} alt="Cropped" className="max-h-[200px] object-contain border border-neutral-700 rounded" />
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
                  
                  {croppedUrl && (
                    <a
                      href={croppedUrl}
                      download={`cropped_${file.name}`}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Download size={18} />
                      Download Cropped
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
