import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { Worker, Project, HourLog, ThemeColor } from '@/src/types';
import BottomNav from '@/src/components/BottomNav';
import Header from '@/src/components/Header';
import InsertionTab from '@/src/components/InsertionTab';
import SummaryTab from '@/src/components/SummaryTab';
import SettingsTab from '@/src/components/SettingsTab';
import { cn } from '@/src/lib/utils';

const INITIAL_WORKERS: Worker[] = [
  { id: '1', name: 'Mario Rossi' },
  { id: '2', name: 'Luigi Bianchi' },
  { id: '3', name: 'Paolo Verdi' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Cantiere Milano' },
  { id: 'p2', name: 'Ristrutturazione Roma' },
  { id: 'p3', name: 'Manutenzione Torino' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [workers, setWorkers] = useLocalStorage<Worker[]>('lavoratori', INITIAL_WORKERS);
  const [projects, setProjects] = useLocalStorage<Project[]>('progetti', INITIAL_PROJECTS);
  const [logs, setLogs] = useLocalStorage<HourLog[]>('log_ore', []);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dark_mode', false);
  const [themeColor, setThemeColor] = useLocalStorage<ThemeColor>('theme_color', 'indigo');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveLog = (log: HourLog) => {
    setLogs(prev => [log, ...prev]);
    setActiveTab(1); // Switch to summary
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleAddWorker = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setWorkers(prev => {
      const exists = prev.some(w => w.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) return prev;
      return [...prev, { id: crypto.randomUUID(), name: trimmedName }];
    });
  };

  const handleRemoveWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleAddProject = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setProjects(prev => {
      const exists = prev.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) return prev;
      return [...prev, { id: crypto.randomUUID(), name: trimmedName }];
    });
  };

  const handleRemoveProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleReset = () => {
    setWorkers(INITIAL_WORKERS);
    setProjects(INITIAL_PROJECTS);
    setLogs([]);
    setThemeColor('indigo');
    setDarkMode(false);
  };

  const handleImport = (data: any, mode: 'overwrite' | 'merge') => {
    if (mode === 'overwrite') {
      setWorkers(data.workers);
      setProjects(data.projects);
      setLogs(data.logs);
    } else {
      // Merge workers and projects by name to avoid duplicates (case-insensitive)
      const mergedWorkers = [...workers];
      data.workers.forEach((nw: Worker) => {
        if (!mergedWorkers.some(w => w.name.toLowerCase() === nw.name.toLowerCase())) {
          mergedWorkers.push(nw);
        }
      });
      
      const mergedProjects = [...projects];
      data.projects.forEach((np: Project) => {
        if (!mergedProjects.some(p => p.name.toLowerCase() === np.name.toLowerCase())) {
          mergedProjects.push(np);
        }
      });

      setWorkers(mergedWorkers);
      setProjects(mergedProjects);
      setLogs(prev => [...data.logs, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Header themeColor={themeColor} />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-32">
        {activeTab === 0 && (
          <InsertionTab 
            workers={workers} 
            projects={projects} 
            onSave={handleSaveLog}
            themeColor={themeColor}
          />
        )}
        {activeTab === 1 && (
          <SummaryTab 
            logs={logs} 
            onDelete={handleDeleteLog}
            themeColor={themeColor}
          />
        )}
        {activeTab === 2 && (
          <SettingsTab 
            workers={workers}
            projects={projects}
            logs={logs}
            onAddWorker={handleAddWorker}
            onRemoveWorker={handleRemoveWorker}
            onAddProject={handleAddProject}
            onRemoveProject={handleRemoveProject}
            onReset={handleReset}
            onImport={handleImport}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            themeColor={themeColor}
            setThemeColor={setThemeColor}
          />
        )}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        themeColor={themeColor}
      />
    </div>
  );
}
