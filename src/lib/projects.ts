export interface Project {
  id: string;
  url: string;
  title: string;
  description: string;
  firstStep: string;
  addedAt: string;
  completed: boolean;
}

const STORAGE_KEY = "antiprocrastination-projects";

export function getProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(project: Omit<Project, "id" | "addedAt" | "completed">): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    completed: false,
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

export function getRandomIncompleteProject(): Project | null {
  const incomplete = getProjects().filter((p) => !p.completed);
  if (incomplete.length === 0) return null;
  return incomplete[Math.floor(Math.random() * incomplete.length)];
}

// Simple extraction without AI - extracts domain and path info
export function extractProjectFromUrl(url: string): { title: string; description: string; firstStep: string } {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace("www.", "");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    
    const platformHints: Record<string, string> = {
      "instagram.com": "Instagram project inspiration",
      "youtube.com": "YouTube tutorial/project",
      "pinterest.com": "Pinterest project idea",
      "tiktok.com": "TikTok project inspiration",
      "github.com": "GitHub project",
      "reddit.com": "Reddit project idea",
    };

    const hint = platformHints[domain] || `Project from ${domain}`;
    const slug = pathParts[pathParts.length - 1]?.replace(/[-_]/g, " ") || "";

    return {
      title: slug ? `${hint}: ${slug.slice(0, 50)}` : hint,
      description: `Saved from ${url}`,
      firstStep: "Open the link and review the project details to understand the scope",
    };
  } catch {
    return {
      title: "New project idea",
      description: url,
      firstStep: "Research this project idea and outline the key steps",
    };
  }
}
