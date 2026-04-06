import { useState, useMemo } from 'react';
import { Trash2, Calendar, Users, Briefcase, Filter, X, ListChecks, FileDown, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { HourLog } from '@/src/types';

interface SummaryTabProps {
  logs: HourLog[];
  onDelete: (id: string) => void;
  themeColor: string;
}

export default function SummaryTab({ logs, onDelete, themeColor }: SummaryTabProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const availableYears = new Set([currentYear]);
    logs.forEach(log => availableYears.add(getYear(parseISO(log.date))));
    return Array.from(availableYears).sort((a, b) => b - a);
  }, [logs]);

  const themeText: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  const themeBg: Record<string, string> = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    zinc: 'bg-zinc-900 dark:bg-zinc-100',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-600',
  };

  const themeBadge: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600',
    zinc: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600',
    rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
  };

  // Filter logs by month and year
  const monthlyLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = parseISO(log.date);
      return getMonth(logDate) === selectedMonth && getYear(logDate) === selectedYear;
    });
  }, [logs, selectedMonth, selectedYear]);

  // Aggregate data per worker
  const workerStats = useMemo(() => {
    const stats: Record<string, { total: number; projects: Record<string, number>; logIds: string[] }> = {};
    
    monthlyLogs.forEach(log => {
      log.workerNames.forEach(workerName => {
        if (!stats[workerName]) {
          stats[workerName] = { total: 0, projects: {}, logIds: [] };
        }
        stats[workerName].total += log.totalHours;
        stats[workerName].logIds.push(log.id);
        
        log.projects.forEach(p => {
          stats[workerName].projects[p.projectName] = (stats[workerName].projects[p.projectName] || 0) + p.hours;
        });
      });
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [monthlyLogs]);

  const handleExportCSV = () => {
    if (workerStats.length === 0) return;

    // 1. Ore totali per lavoratore
    const workerTotals = workerStats;
    const projectTotals: Record<string, number> = {};
    const workerDays: Record<string, Set<string>> = {};

    monthlyLogs.forEach(log => {
      log.workerNames.forEach(workerName => {
        if (!workerDays[workerName]) workerDays[workerName] = new Set();
        workerDays[workerName].add(log.date);
      });
      log.projects.forEach(p => {
        projectTotals[p.projectName] = (projectTotals[p.projectName] || 0) + p.hours;
      });
    });

    let csvContent = "\ufeff"; // BOM for Excel UTF-8

    csvContent += `RIEPILOGO MENSILE: ${months[selectedMonth]} ${selectedYear}\n\n`;

    // Report 1: Ore totali per lavoratore
    csvContent += "REPORT 1: ORE TOTALI PER LAVORATORE\n";
    csvContent += "Lavoratore;Ore Totali\n";
    workerTotals.forEach(w => {
      csvContent += `${w.name};${w.total.toFixed(2).replace('.', ',')}\n`;
    });
    csvContent += "\n";

    // Report 2: Media mensile ore lavorate
    csvContent += "REPORT 2: MEDIA ORE LAVORATE PER LAVORATORE\n";
    csvContent += "Lavoratore;Ore Totali;Giorni Lavorati;Media Ore/Giorno\n";
    workerTotals.forEach(w => {
      const days = workerDays[w.name]?.size || 0;
      const avg = days > 0 ? w.total / days : 0;
      csvContent += `${w.name};${w.total.toFixed(2).replace('.', ',')};${days};${avg.toFixed(2).replace('.', ',')}\n`;
    });
    csvContent += "\n";

    // Report 3: Dettaglio ore per progetto per lavoratore
    csvContent += "REPORT 3: DETTAGLIO ORE PER PROGETTO PER LAVORATORE\n";
    csvContent += "Lavoratore;Progetto;Ore Progetto\n";
    workerTotals.forEach(w => {
      Object.entries(w.projects).forEach(([projectName, hours]) => {
        const h = hours as number;
        csvContent += `${w.name};${projectName};${h.toFixed(2).replace('.', ',')}\n`;
      });
    });
    csvContent += "\n";

    // Report 4: Totale ore per progetto (tutti i lavoratori)
    csvContent += "REPORT 4: TOTALE ORE PER PROGETTO (TUTTI I LAVORATORI)\n";
    csvContent += "Progetto;Ore Totali Progetto\n";
    Object.entries(projectTotals).forEach(([projectName, total]) => {
      csvContent += `${projectName};${total.toFixed(2).replace('.', ',')}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_mensile_${months[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl text-white", themeBg[themeColor])}>
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Riepilogo Mensile</h1>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={workerStats.length === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-zinc-200 dark:shadow-none",
              themeBg[themeColor]
            )}
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Esporta in CSV</span>
          </button>
        </div>

        {/* Month/Year Selectors */}
        <div className="flex gap-2">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all appearance-none cursor-pointer"
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all appearance-none cursor-pointer text-center"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Workers Accordion List */}
      <section className="space-y-3">
        {workerStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
            <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-900">
              <ListChecks size={48} strokeWidth={1} />
            </div>
            <p className="font-medium">Nessun dato per questo mese.</p>
          </div>
        ) : (
          workerStats.map(worker => (
            <div key={worker.name} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setExpandedWorker(expandedWorker === worker.name ? null : worker.name)}
                className="w-full p-4 flex justify-between items-center group active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors"
              >
                <span className="text-lg font-bold tracking-tight group-hover:translate-x-1 transition-transform">{worker.name}</span>
                <div className="flex items-center gap-3">
                  <div className={cn("px-3 py-1 rounded-full text-sm font-black tabular-nums", themeBadge[themeColor])}>
                    Totale: {worker.total.toFixed(2)} ore
                  </div>
                  {expandedWorker === worker.name ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
                </div>
              </button>

              {expandedWorker === worker.name && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">
                      <span>Progetto</span>
                      <span>Ore Progetto</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(worker.projects).map(([projectName, hours]) => (
                        <div key={projectName} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{projectName}</span>
                          <span className="font-bold tabular-nums">{(hours as number).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Option to see/delete individual logs if needed, or just keep it clean like the image */}
                    <div className="pt-2 flex justify-end">
                      <p className="text-[10px] text-zinc-400 italic">Dettaglio basato su {worker.logIds.length} inserimenti</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
