export interface ProgressCheckIn {
  date: string; // ISO date string
  note: string;
}

export interface Project {
  id: string;
  url: string;
  title: string;
  description: string;
  firstStep: string;
  addedAt: string;
  completed: boolean;
  accepted: boolean;
  checkIns: ProgressCheckIn[];
}

const STORAGE_KEY = "antiprocrastination-projects";

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const projects = raw ? JSON.parse(raw) : [];
    // Migrate old projects missing new fields
    return projects.map((p: any) => ({
      ...p,
      accepted: p.accepted ?? false,
      checkIns: p.checkIns ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(project: Omit<Project, "id" | "addedAt" | "completed" | "accepted" | "checkIns">): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    completed: false,
    accepted: false,
    checkIns: [],
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function removeProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function toggleComplete(id: string): void {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, completed: !p.completed } : p
  );
  saveProjects(projects);
}

export function acceptProject(id: string): void {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, accepted: true } : p
  );
  saveProjects(projects);
}

export function addCheckIn(id: string, note: string): void {
  const projects = getProjects().map((p) =>
    p.id === id
      ? { ...p, checkIns: [...p.checkIns, { date: new Date().toISOString(), note }] }
      : p
  );
  saveProjects(projects);
}

export function getRandomIncompleteProject(): Project | null {
  const incomplete = getProjects().filter((p) => !p.completed && !p.accepted);
  if (incomplete.length === 0) return null;
  return incomplete[Math.floor(Math.random() * incomplete.length)];
}

export function getAcceptedProjects(): Project[] {
  return getProjects().filter((p) => p.accepted && !p.completed);
}
