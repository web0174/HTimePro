import { useState } from 'react';
import { Trash2, Calendar, Users, Briefcase, Filter, X, ListChecks } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { HourLog } from '@/src/types';

interface SummaryTabProps {
  logs: HourLog[];
  onDelete: (id: string) => void;
  themeColor: string;
}

export default function SummaryTab({ logs, onDelete, themeColor }: SummaryTabProps) {
  const [filterDate, setFilterDate] = useState('');
  const [filterWorker, setFilterWorker] = useState('');

  const themeText: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  const filteredLogs = logs.filter(log => {
    const dateMatch = !filterDate || log.date === filterDate;
    const workerMatch = !filterWorker || log.workerNames.some(name => name.toLowerCase().includes(filterWorker.toLowerCase()));
    return dateMatch && workerMatch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Riepilogo</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Visualizza e gestisci i log delle ore.</p>
      </header>

      {/* Filters */}
      <section className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 mb-2">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Filtri</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all"
            />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Filtra per lavoratore..."
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all"
            />
          </div>
        </div>
        {(filterDate || filterWorker) && (
          <button 
            onClick={() => { setFilterDate(''); setFilterWorker(''); }}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <X size={14} />
            Resetta Filtri
          </button>
        )}
      </section>

      {/* Logs List */}
      <section className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
            <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-900">
              <ListChecks size={48} strokeWidth={1} />
            </div>
            <p className="font-medium">Nessun log trovato.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={themeText[themeColor]} />
                    <span className="text-sm font-bold uppercase tracking-tight">
                      {format(parseISO(log.date), 'EEEE d MMMM', { locale: it })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Users size={14} />
                    <span className="text-xs font-medium">{log.workerNames.join(', ')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn("text-2xl font-black tabular-nums", themeText[themeColor])}>{log.totalHours.toFixed(1)}h</span>
                  <button 
                    onClick={() => {
                      if (confirm("Sei sicuro di voler eliminare questo log?")) {
                        onDelete(log.id);
                      }
                    }}
                    className="p-2 text-zinc-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/20 space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Briefcase size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Dettaglio Progetti</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {log.projects.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-zinc-600 dark:text-zinc-400">{p.projectName}</span>
                      <span className="font-bold tabular-nums">{p.hours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
