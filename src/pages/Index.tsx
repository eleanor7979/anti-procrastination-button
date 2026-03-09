import { useState, useCallback } from "react";
import { getProjects, getRandomIncompleteProject, getAcceptedProjects, Project } from "@/lib/projects";
import BigRedButton from "@/components/BigRedButton";
import AddProjectModal from "@/components/AddProjectModal";
import ProjectList from "@/components/ProjectList";
import AssignmentOverlay from "@/components/AssignmentOverlay";
import ProgressTracker from "@/components/ProgressTracker";
import { Flame, ListTodo, Activity } from "lucide-react";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(getProjects);
  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [view, setView] = useState<"button" | "list" | "progress">("button");

  const refresh = useCallback(() => setProjects(getProjects()), []);

  const handleSmash = () => {
    const project = getRandomIncompleteProject();
    if (project) setAssignedProject(project);
  };

  const incompleteCount = projects.filter((p) => !p.completed && !p.accepted).length;
  const acceptedProjects = projects.filter((p) => p.accepted && !p.completed);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-gradient-fire">AntiProcrastinator</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {acceptedProjects.length > 0 && (
            <button
              onClick={() => setView(view === "progress" ? "button" : "progress")}
              className="flex items-center gap-2 text-sm text-accent hover:text-foreground transition-colors"
            >
              <Activity className="w-4 h-4" />
              {acceptedProjects.length} active
            </button>
          )}
          <button
            onClick={() => setView(view === "list" ? "button" : "list")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListTodo className="w-4 h-4" />
            {incompleteCount} queued
          </button>
          <AddProjectModal onAdded={refresh} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {view === "list" ? (
          <div className="w-full max-w-2xl py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Projects</h2>
              <button
                onClick={() => setView("button")}
                className="text-sm text-primary hover:underline"
              >
                Back to button
              </button>
            </div>
            <ProjectList projects={projects} onUpdate={refresh} />
          </div>
        ) : view === "progress" ? (
          <div className="w-full max-w-2xl py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Active Projects</h2>
              <button
                onClick={() => setView("button")}
                className="text-sm text-primary hover:underline"
              >
                Back to button
              </button>
            </div>
            <ProgressTracker projects={acceptedProjects} onUpdate={refresh} />
          </div>
        ) : (
          <BigRedButton onClick={handleSmash} disabled={incompleteCount === 0} />
        )}
      </main>

      <AssignmentOverlay
        project={assignedProject}
        onClose={() => setAssignedProject(null)}
        onAccept={() => refresh()}
        onDecline={() => setAssignedProject(null)}
      />
    </div>
  );
};

export default Index;
