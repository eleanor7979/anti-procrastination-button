import { Project, removeProject, toggleComplete } from "@/lib/projects";
import { ExternalLink, Trash2, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ProjectListProps {
  projects: Project[];
  onUpdate: () => void;
}

const ProjectList = ({ projects, onUpdate }: ProjectListProps) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No projects yet.</p>
        <p className="text-sm mt-1">Paste a link to add your first project idea!</p>
      </div>
    );
  }

  const handleRemove = (id: string) => {
    removeProject(id);
    toast("Project removed");
    onUpdate();
  };

  const handleToggle = (id: string) => {
    toggleComplete(id);
    onUpdate();
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 ${
              project.completed ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(project.id)}
                className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
              >
                {project.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${project.completed ? "line-through" : ""}`}>
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
                )}
                <p className="text-xs text-accent mt-1.5">
                  ⚡ First step: {project.firstStep}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleRemove(project.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProjectList;
