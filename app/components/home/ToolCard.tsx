import Link from 'next/link';
import { ReactNode } from 'react';

interface ToolCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: 'indigo' | 'orange' | 'emerald';
}

const colorConfig = {
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
