import { useState, useRef, ChangeEvent } from 'react';
import { 
  UserPlus, 
  Briefcase, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Moon, 
  Sun, 
  Palette,
  Check,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Worker, Project, ThemeColor, HourLog } from '@/src/types';

interface SettingsTabProps {
  workers: Worker[];
  projects: Project[];
  logs: HourLog[];
  onAddWorker: (name: string) => void;
  onRemoveWorker: (id: string) => void;
  onAddProject: (name: string) => void;
  onRemoveProject: (id: string) => void;
  onReset: () => void;
  onImport: (data: any, mode: 'overwrite' | 'merge') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

export default function SettingsTab({
  workers,
  projects,
  logs,
  onAddWorker,
  onRemoveWorker,
  onAddProject,
  onRemoveProject,
  onReset,
  onImport,
  darkMode,
  setDarkMode,
  themeColor,
  setThemeColor
}: SettingsTabProps) {
  const [newWorker, setNewWorker] = useState('');
  const [newProject, setNewProject] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');

  const themeColors: ThemeColor[] = ['blue', 'indigo', 'zinc', 'emerald', 'rose', 'amber'];
  
  const colorMap: Record<ThemeColor, string> = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    zinc: 'bg-zinc-900 dark:bg-zinc-100',
    emerald: 'bg-emerald-600',
    rose: 'bg-rose-600',
    amber: 'bg-amber-600',
  };

  const themeText: Record<string, string> = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-900 dark:text-zinc-100',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmingWorkerId, setConfirmingWorkerId] = useState<string | null>(null);
  const [confirmingProjectId, setConfirmingProjectId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const data = { workers, projects, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hourtracker-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.workers || !data.projects || !data.logs) {
          throw new Error("Formato file non valido.");
        }
        onImport(data, importMode);
        setStatusMessage({ text: "Dati importati con successo!", type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err) {
        setStatusMessage({ text: "Errore: " + (err as Error).message, type: 'error' });
        setTimeout(() => setStatusMessage(null), 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddWorker = () => {
    const trimmed = newWorker.trim();
    if (!trimmed) return;
    
    const exists = workers.some(w => w.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setStatusMessage({ text: "Questo lavoratore esiste già.", type: 'error' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    onAddWorker(trimmed);
    setNewWorker('');
  };

  const handleAddProject = () => {
    const trimmed = newProject.trim();
    if (!trimmed) return;
    
    const exists = projects.some(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setStatusMessage({ text: "Questo progetto esiste già.", type: 'error' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    onAddProject(trimmed);
    setNewProject('');
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Personalizza e gestisci i tuoi dati.</p>
      </header>

      {/* Status Message */}
      {statusMessage && (
        <div className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold animate-in slide-in-from-top-4 duration-300",
          statusMessage.type === 'success' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        )}>
          {statusMessage.text}
        </div>
      )}

      {/* Theme & Appearance */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 px-1">
          <Palette size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Aspetto</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-semibold">Modalità Scura</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                darkMode ? colorMap[themeColor] : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                darkMode ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-zinc-500">Colore Tema</span>
            <div className="flex justify-between items-center gap-2">
              {themeColors.map(color => (
                <button
                  key={color}
                  onClick={() => setThemeColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
                    colorMap[color],
                    themeColor === color ? "ring-4 ring-zinc-200 dark:ring-zinc-700" : ""
                  )}
                >
                  {themeColor === color && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workers Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 px-1">
          <UserPlus size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Gestione Lavoratori</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome lavoratore..."
              value={newWorker}
              onChange={(e) => setNewWorker(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all"
            />
            <button 
              onClick={handleAddWorker}
              className={cn("p-2 rounded-xl text-white active:scale-90 transition-transform", colorMap[themeColor])}
            >
              <UserPlus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {workers.map(worker => (
              <div key={worker.id} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                {confirmingWorkerId === worker.id ? (
                  <div className="flex-1 flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-xs font-bold text-rose-600">Eliminare {worker.name}?</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setConfirmingWorkerId(null)} 
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                      >
                        Annulla
                      </button>
                      <button 
                        onClick={() => { onRemoveWorker(worker.id); setConfirmingWorkerId(null); }} 
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Sì, elimina
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{worker.name}</span>
                    <button 
                      onClick={() => setConfirmingWorkerId(worker.id)} 
                      className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 px-1">
          <Briefcase size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Gestione Progetti</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome progetto..."
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all"
            />
            <button 
              onClick={handleAddProject}
              className={cn("p-2 rounded-xl text-white active:scale-90 transition-transform", colorMap[themeColor])}
            >
              <Briefcase size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {projects.map(project => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                {confirmingProjectId === project.id ? (
                  <div className="flex-1 flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-xs font-bold text-rose-600">Eliminare {project.name}?</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setConfirmingProjectId(null)} 
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                      >
                        Annulla
                      </button>
                      <button 
                        onClick={() => { onRemoveProject(project.id); setConfirmingProjectId(null); }} 
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Sì, elimina
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{project.name}</span>
                    <button 
                      onClick={() => setConfirmingProjectId(project.id)} 
                      className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-400 px-1">
          <Download size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Dati & Backup</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                <Download size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Esporta JSON</p>
                <p className="text-xs text-zinc-500">Scarica un backup dei tuoi dati.</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-500" />
          </button>

          <div className="space-y-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                <Upload size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Importa JSON</p>
                <p className="text-xs text-zinc-500">Carica dati da un file esterno.</p>
              </div>
            </div>
            <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button 
                onClick={() => setImportMode('merge')}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
                  importMode === 'merge' ? cn(colorMap[themeColor], "text-white") : "text-zinc-400"
                )}
              >
                Unisci (Merge)
              </button>
              <button 
                onClick={() => setImportMode('overwrite')}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-bold transition-all",
                  importMode === 'overwrite' ? "bg-rose-500 text-white" : "text-zinc-400"
                )}
              >
                Sovrascrivi
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={cn("w-full py-2 rounded-lg font-bold text-sm text-white", colorMap[themeColor])}
            >
              Seleziona File
            </button>
          </div>

          {showResetConfirm ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-900/30 animate-in zoom-in-95 duration-200">
              <p className="text-sm font-bold text-rose-600 mb-3 text-center">Sei proprio sicuro? Tutti i dati verranno cancellati.</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm"
                >
                  Annulla
                </button>
                <button 
                  onClick={() => {
                    onReset();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  Sì, Resetta
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600">
                  <RotateCcw size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-rose-600">Reset Totale</p>
                  <p className="text-xs text-zinc-500">Cancella log, lavoratori e progetti.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-zinc-300 group-hover:text-rose-500" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
