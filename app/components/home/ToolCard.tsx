import Link from 'next/link';
import { ReactNode } from 'react';

type AccentColor = 'indigo' | 'orange' | 'emerald' | 'pink' | 'cyan' | 'red' | 'violet' | 'amber' | 'sky' | 'teal' | 'slate';

interface ToolCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: AccentColor;
}

const colorConfig: Record<AccentColor, { border: string; iconBg: string; iconText: string }> = {
  indigo: {
    border: 'hover:border-indigo-500',
    iconBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
    iconText: 'text-indigo-400',
  },
  orange: {
    border: 'hover:border-orange-500',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    iconText: 'text-orange-400',
  },
  emerald: {
    border: 'hover:border-emerald-500',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconText: 'text-emerald-400',
  },
  pink: {
    border: 'hover:border-pink-500',
    iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
    iconText: 'text-pink-400',
  },
  cyan: {
    border: 'hover:border-cyan-500',
    iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    iconText: 'text-cyan-400',
  },
  red: {
    border: 'hover:border-red-500',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
    iconText: 'text-red-400',
  },
  violet: {
    border: 'hover:border-violet-500',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    iconText: 'text-violet-400',
  },
  amber: {
    border: 'hover:border-amber-500',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconText: 'text-amber-400',
  },
  sky: {
    border: 'hover:border-sky-500',
    iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    iconText: 'text-sky-400',
  },
  teal: {
    border: 'hover:border-teal-500',
    iconBg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    iconText: 'text-teal-400',
  },
  slate: {
    border: 'hover:border-slate-500',
    iconBg: 'bg-slate-500/10 group-hover:bg-slate-500/20',
    iconText: 'text-slate-400',
  },
};

export const ToolCard = ({ href, icon, title, description, accentColor }: ToolCardProps) => {
  const colors = colorConfig[accentColor];

  return (
    <Link
      href={href}
      className={`group border border-neutral-800 bg-neutral-900 p-8 rounded-2xl ${colors.border} hover:bg-neutral-800/50 transition-all cursor-pointer flex flex-col items-center text-center gap-4`}
    >
      <div className={`p-4 ${colors.iconBg} rounded-full transition-colors ${colors.iconText}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-neutral-200">{title}</h2>
        <p className="text-sm text-neutral-400 mt-2">{description}</p>
      </div>
    </Link>
  );
};
