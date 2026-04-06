import { cn } from '@/src/lib/utils';

interface HeaderProps {
  themeColor: string;
}

export default function Header({ themeColor }: HeaderProps) {
  const themeText: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-16 px-6 flex items-center gap-3 z-50">
      <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
          <img 
            src="https://picsum.photos/seed/hourtracker/100/100" 
            alt="Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-lg font-black tracking-tighter leading-none uppercase", themeText[themeColor])}>
            HourTracker
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 leading-none mt-1">
            Pro Edition
          </span>
        </div>
      </div>
    </header>
  );
}
