import { PlusCircle, ListChecks, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  themeColor: string;
}

export default function BottomNav({ activeTab, setActiveTab, themeColor }: BottomNavProps) {
  const tabs = [
    { id: 0, label: 'Inserimento', icon: PlusCircle },
    { id: 1, label: 'Riepilogo', icon: ListChecks },
    { id: 2, label: 'Impostazioni', icon: Settings },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe pt-2 px-6 flex justify-around items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              isActive ? colorMap[themeColor] : "text-zinc-400 dark:text-zinc-500"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
