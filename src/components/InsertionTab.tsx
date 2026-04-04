import { useState, useEffect } from 'react';
import { Plus, Minus, X, Check, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { Worker, Project, ProjectLog, HourLog } from '@/src/types';

interface InsertionTabProps {
  workers: Worker[];
  projects: Project[];
  onSave: (log: HourLog) => void;
  themeColor: string;
}

export default function InsertionTab({ workers, projects, onSave, themeColor }: InsertionTabProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [totalHours, setTotalHours] = useState(8);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [activeProjects, setActiveProjects] = useState<ProjectLog[]>([]);
  const [currentProject, setCurrentProject] = useState<string>('');
  const [currentHours, setCurrentHours] = useState<number>(0);

  const themeColors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    zinc: 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
  };

  const themeBorder: Record<string, string> = {
    blue: 'border-blue-600',
    indigo: 'border-indigo-600',
    zinc: 'border-zinc-900 dark:border-zinc-100',
    emerald: 'border-emerald-600',
    rose: 'border-rose-600',
    amber: 'border-amber-600',
  };

  const themeText: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  const allocatedHours = activeProjects.reduce((sum, p) => sum + p.hours, 0);
  const residualHours = Math.max(0, totalHours - allocatedHours);

  useEffect(() => {
    setCurrentHours(residualHours);
  }, [residualHours]);

  const toggleWorker = (id: string) => {
    setSelectedWorkers(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const addProject = () => {
    if (!currentProject || currentHours <= 0) return;
    const project = projects.find(p => p.id === currentProject);
    if (!project) return;

    setActiveProjects(prev => [...prev, {
      projectId: project.id,
      projectName: project.name,
      hours: currentHours
    }]);
    setCurrentProject('');
  };

  const removeProject = (index: number) => {
    setActiveProjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (selectedWorkers.length === 0 || activeProjects.length === 0) {
      alert("Seleziona almeno un lavoratore e un progetto.");
      return;
    }

    const workerNames = selectedWorkers.map(id => workers.find(w => w.id === id)?.name || '');

    onSave({
      id: crypto.randomUUID(),
      date,
      totalHours,
      workerIds: selectedWorkers,
      workerNames,
      projects: activeProjects,
      createdAt: new Date().toISOString()
    });

    // Reset form
    setSelectedWorkers([]);
    setActiveProjects([]);
    setTotalHours(8);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Log</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Inserisci le ore lavorate oggi.</p>
      </header>

      {/* Date & Total Hours */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">Data</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-lg font-medium outline-none"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">Ore Totali Giornaliere</label>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setTotalHours(prev => Math.max(0.5, prev - 0.5))}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-90 transition-transform"
            >
              <Minus size={20} />
            </button>
            <span className="text-3xl font-bold tabular-nums">{totalHours.toFixed(1)}</span>
            <button 
              onClick={() => setTotalHours(prev => prev + 0.5)}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-90 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Workers Selection */}
      <section className="space-y-3">
        <label className="text-xs font-semibold uppercase text-zinc-400 px-1">Lavoratori</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {workers.map(worker => (
            <button
              key={worker.id}
              onClick={() => toggleWorker(worker.id)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left",
                selectedWorkers.includes(worker.id) 
                  ? cn(themeBorder[themeColor], themeText[themeColor], "bg-zinc-50 dark:bg-zinc-800/50 font-semibold")
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span className="truncate">{worker.name}</span>
              {selectedWorkers.includes(worker.id) && <Check size={16} />}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-semibold uppercase text-zinc-400">Progetti</label>
          <span className="text-xs font-medium text-zinc-500">
            Residuo: <span className={cn("font-bold", residualHours > 0 ? themeText[themeColor] : "text-zinc-400")}>{residualHours.toFixed(1)}h</span>
          </span>
        </div>

        <div className="space-y-2">
          {activeProjects.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-left-2">
              <div className="flex flex-col">
                <span className="font-semibold">{p.projectName}</span>
                <span className="text-xs text-zinc-500">{p.hours.toFixed(1)} ore</span>
              </div>
              <button 
                onClick={() => removeProject(idx)}
                className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select 
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all"
            >
              <option value="">Seleziona Progetto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2">
              <button onClick={() => setCurrentHours(prev => Math.max(0.5, prev - 0.5))} className="text-zinc-400"><Minus size={16} /></button>
              <span className="flex-1 text-center font-bold tabular-nums">{currentHours.toFixed(1)}</span>
              <button onClick={() => setCurrentHours(prev => prev + 0.5)} className="text-zinc-400"><Plus size={16} /></button>
            </div>
          </div>
          <button 
            onClick={addProject}
            disabled={!currentProject || currentHours <= 0}
            className={cn(
              "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100",
              themeColors[themeColor]
            )}
          >
            <Plus size={20} />
            Aggiungi Progetto
          </button>
        </div>
      </section>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lg shadow-lg shadow-zinc-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-all",
          themeColors[themeColor]
        )}
      >
        Salva Log
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
