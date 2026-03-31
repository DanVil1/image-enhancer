import { Settings2 } from 'lucide-react';
import { ReactNode } from 'react';

interface SettingsPanelProps {
  title?: string;
  children: ReactNode;
  accentColor?: 'indigo' | 'orange' | 'emerald' | 'pink';
}

const colorClasses = {
  indigo: 'text-indigo-400',
  orange: 'text-orange-400',
  emerald: 'text-emerald-400',
  pink: 'text-pink-400',
};

export const SettingsPanel = ({
  title = 'Settings',
  children,
  accentColor = 'indigo',
}: SettingsPanelProps) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
      <div className={`flex items-center gap-2 ${colorClasses[accentColor]} mb-6`}>
        <Settings2 size={20} />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
