import { useState, useCallback } from "react";
import { getProjects, getRandomIncompleteProject, Project } from "@/lib/projects";
import BigRedButton from "@/components/BigRedButton";
import AddProjectModal from "@/components/AddProjectModal";
import ProjectList from "@/components/ProjectList";
import AssignmentOverlay from "@/components/AssignmentOverlay";
import ProgressTracker from "@/components/ProgressTracker";
import InterestSuggestions from "@/components/InterestSuggestions";
import { Flame, Zap, Activity, ListTodo, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(getProjects);
  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [tab, setTab] = useState("button");

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
        <AddProjectModal onAdded={refresh} />
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger
              value="button"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
            >
              <Zap className="w-4 h-4 mr-2" />
              Go!
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
            >
              <Activity className="w-4 h-4 mr-2" />
              Progress
              {acceptedProjects.length > 0 && (
                <span className="ml-1.5 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                  {acceptedProjects.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Queue
              {incompleteCount > 0 && (
                <span className="ml-1.5 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {incompleteCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="interests"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {tab === "button" && (
          <BigRedButton onClick={handleSmash} disabled={incompleteCount === 0} />
        )}
        {tab === "progress" && (
          <div className="w-full max-w-2xl py-8">
            <ProgressTracker projects={acceptedProjects} onUpdate={refresh} />
          </div>
        )}
        {tab === "list" && (
          <div className="w-full max-w-2xl py-8">
            <ProjectList projects={projects} onUpdate={refresh} />
          </div>
        )}
        {tab === "interests" && (
          <div className="w-full max-w-2xl py-8">
            <p className="text-muted-foreground text-sm mb-4">
              Tell us your interests and AI will suggest projects for you to add to your queue.
            </p>
            <InterestSuggestions onAdded={refresh} />
          </div>
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
