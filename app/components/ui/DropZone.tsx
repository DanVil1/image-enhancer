'use client';

import { Upload } from 'lucide-react';

type AccentColor = 'indigo' | 'orange' | 'emerald' | 'pink' | 'cyan' | 'red' | 'violet' | 'amber' | 'sky' | 'teal' | 'slate';

interface DropZoneProps {
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  sublabel?: string;
  inputId?: string;
  accentColor?: AccentColor;
  multiple?: boolean;
}

const hoverBorderColors: Record<AccentColor, string> = {
  indigo: 'hover:border-indigo-500',
  orange: 'hover:border-orange-500',
  emerald: 'hover:border-emerald-500',
  pink: 'hover:border-pink-500',
  cyan: 'hover:border-cyan-500',
  red: 'hover:border-red-500',
  violet: 'hover:border-violet-500',
  amber: 'hover:border-amber-500',
  sky: 'hover:border-sky-500',
  teal: 'hover:border-teal-500',
  slate: 'hover:border-slate-500',
};

const hoverIconColors: Record<AccentColor, string> = {
  indigo: 'group-hover:text-indigo-400',
  orange: 'group-hover:text-orange-400',
  emerald: 'group-hover:text-emerald-400',
  pink: 'group-hover:text-pink-400',
  cyan: 'group-hover:text-cyan-400',
  red: 'group-hover:text-red-400',
  violet: 'group-hover:text-violet-400',
  amber: 'group-hover:text-amber-400',
  sky: 'group-hover:text-sky-400',
  teal: 'group-hover:text-teal-400',
  slate: 'group-hover:text-slate-400',
};

export const DropZone = ({
  onDrop,
  onFileSelect,
  label = 'Drag & Drop or Click to Upload',
  sublabel = 'Supports JPG, PNG, WEBP',
  inputId = 'file-upload',
  accentColor = 'indigo',
  multiple = false,
}: DropZoneProps) => {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`h-96 border-2 border-dashed border-neutral-800 ${hoverBorderColors[accentColor]} bg-neutral-900/50 hover:bg-neutral-900 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
        id={inputId}
        multiple={multiple}
      />
      <label htmlFor={inputId} className="flex flex-col items-center cursor-pointer">
        <div className="p-5 bg-neutral-800 rounded-full group-hover:scale-110 transition-transform mb-4">
          <Upload size={32} className={`text-neutral-400 ${hoverIconColors[accentColor]}`} />
        </div>
        <p className="text-lg font-medium text-neutral-300">{label}</p>
        {sublabel && (
          <p className="text-sm text-neutral-500 mt-2">{sublabel}</p>
        )}
      </label>
    </div>
  );
};
