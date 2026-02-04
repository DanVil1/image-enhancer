'use client';

import { PreviewBackground } from '../../types';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  previewBg?: PreviewBackground;
  pixelated?: boolean;
  showLabel?: boolean;
}

const TRANSPARENCY_GRID_URL = "https://media.istockphoto.com/id/1303646549/vector/transparent-background-grid-seamless-pattern.jpg?s=612x612&w=0&k=20&c=N7t7k0h2d3aO4Fq2f1s3e4d5c6b7a8n9m0";

export const ImagePreview = ({
  src,
  alt = 'Preview',
  previewBg = 'transparent',
  pixelated = false,
  showLabel = true,
}: ImagePreviewProps) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative">
      {showLabel && (
        <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded text-xs text-white backdrop-blur-sm z-20">
          Preview
        </div>
      )}
      
      {/* Background layer for transparency grid */}
      {previewBg === 'transparent' && (
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url('${TRANSPARENCY_GRID_URL}')`,
            backgroundRepeat: 'repeat'
          }}
        />
      )}
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={pixelated ? { imageRendering: 'pixelated' } : undefined}
        className={`relative z-10 w-full h-auto object-contain max-h-[500px] ${
          previewBg === 'white' ? 'bg-white' : previewBg === 'black' ? 'bg-black' : ''
        }`}
      />
    </div>
  );
};
