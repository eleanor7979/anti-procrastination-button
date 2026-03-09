import { Project, acceptProject } from "@/lib/projects";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Zap, ThumbsUp, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AssignmentOverlayProps {
  project: Project | null;
  onClose: () => void;
  onAccept: (project: Project) => void;
  onDecline: () => void;
}

const AssignmentOverlay = ({ project, onClose, onAccept, onDecline }: AssignmentOverlayProps) => {
  const handleAccept = () => {
    if (!project) return;
    acceptProject(project.id);
    toast.success("Project accepted! Let's track your progress.");
    onAccept(project);
    onClose();
  };

  const handleDecline = () => {
    toast("Reshuffled! Try again when you're ready.", { icon: "🔀" });
    onDecline();
    onClose();
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg rounded-2xl border border-primary/30 bg-card p-8 glow-red"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                Your mission
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-3">{project.title}</h2>

            {project.description && (
              <p className="text-muted-foreground mb-6">{project.description}</p>
            )}

            <div className="rounded-xl bg-secondary p-5 mb-6">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">
                ⚡ Start here
              </p>
              <p className="text-foreground font-medium">{project.firstStep}</p>
            </div>

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ExternalLink className="w-4 h-4" />
                View original link
              </a>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1 border-border hover:border-muted-foreground"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button onClick={handleAccept} className="flex-1">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Accept
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentOverlay;
