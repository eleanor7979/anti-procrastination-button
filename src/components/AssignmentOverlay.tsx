import { Project } from "@/lib/projects";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentOverlayProps {
  project: Project | null;
  onClose: () => void;
}

const AssignmentOverlay = ({ project, onClose }: AssignmentOverlayProps) => {
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

            <div className="flex gap-3">
              {project.url && (
                <Button asChild variant="outline" className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10">
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </a>
                </Button>
              )}
              <Button onClick={onClose} className="flex-1">
                Let's Go!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentOverlay;
