export interface Worker {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface ProjectLog {
  projectId: string;
  projectName: string;
  hours: number;
}

export interface HourLog {
  id: string;
  date: string; // ISO string
  totalHours: number;
  workerIds: string[];
  workerNames: string[];
  projects: ProjectLog[];
  createdAt: string;
}

export type ThemeColor = 'blue' | 'indigo' | 'zinc' | 'emerald' | 'rose' | 'amber';

export interface AppSettings {
  darkMode: boolean;
  themeColor: ThemeColor;
}
