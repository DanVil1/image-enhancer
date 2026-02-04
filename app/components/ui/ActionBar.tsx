'use client';

import { Download, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionBarProps {
  children?: ReactNode;
  downloadUrl: string;
  downloadName: string;
  onDiscard: () => void;
  accentColor?: 'indigo' | 'orange' | 'emerald';
}

const buttonColors = {
  indigo: 'bg-indigo-600 hover:bg-indigo-500',
  orange: 'bg-orange-600 hover:bg-orange-500',
  emerald: 'bg-emerald-600 hover:bg-emerald-500',
};

export const ActionBar = ({
  children,
  downloadUrl,
  downloadName,
  onDiscard,
  accentColor = 'indigo',
}: ActionBarProps) => {
  return (
    <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
      <div className="flex items-center gap-3">
        {children}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onDiscard}
          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
          title="Discard"
        >
          <Trash2 size={20} />
        </button>
        <a
          href={downloadUrl}
          download={downloadName}
          className={`${buttonColors[accentColor]} text-white px-6 py-2 rounded-lg text-sm font-medium flex gap-2 items-center`}
        >
          <Download size={16} /> Download
        </a>
      </div>
    </div>
  );
};
