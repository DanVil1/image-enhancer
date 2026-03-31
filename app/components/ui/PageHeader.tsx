import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AccentColor = 'indigo' | 'orange' | 'emerald' | 'pink' | 'cyan' | 'red' | 'violet' | 'amber' | 'sky' | 'teal' | 'slate';

interface PageHeaderProps {
  title: string;
  accentColor?: AccentColor;
}

const colorClasses: Record<AccentColor, string> = {
  indigo: 'text-indigo-400',
  orange: 'text-orange-400',
  emerald: 'text-emerald-400',
  pink: 'text-pink-400',
  cyan: 'text-cyan-400',
  red: 'text-red-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
  sky: 'text-sky-400',
  teal: 'text-teal-400',
  slate: 'text-slate-400',
};

export const PageHeader = ({ title, accentColor = 'indigo' }: PageHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link 
        href="/" 
        className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
      >
        <ArrowLeft size={24} />
      </Link>
      <h1 className={`text-2xl font-bold ${colorClasses[accentColor]}`}>
        {title}
      </h1>
    </div>
  );
};
