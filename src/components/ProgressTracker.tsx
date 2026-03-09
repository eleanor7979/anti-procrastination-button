import { useState } from "react";
import { Project, addCheckIn, toggleComplete } from "@/lib/projects";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trophy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, isToday } from "date-fns";

interface ProgressTrackerProps {
  projects: Project[];
  onUpdate: () => void;
}

const ProgressTracker = ({ projects, onUpdate }: ProgressTrackerProps) => {
  const [checkInText, setCheckInText] = useState<Record<string, string>>({});

  const handleCheckIn = (projectId: string) => {
    const note = checkInText[projectId]?.trim();
    if (!note) {
      toast.error("Write a quick update on your progress!");
      return;
    }
    addCheckIn(projectId, note);
    setCheckInText((prev) => ({ ...prev, [projectId]: "" }));
    toast.success("Progress logged! Keep it up! 🔥");
    onUpdate();
  };

  const handleComplete = (projectId: string) => {
    toggleComplete(projectId);
    toast.success("Project completed! You crushed it! 🏆");
    onUpdate();
  };

  if (projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>No active projects yet. Hit the button to get assigned one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => {
          const hasCheckedInToday = project.checkIns.some((c) =>
            isToday(new Date(c.date))
          );

          return (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Check-in timeline */}
              <div className="mb-4">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">
                  Daily Check-ins ({project.checkIns.length})
                </p>
                {project.checkIns.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {project.checkIns.map((checkIn, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground text-xs">
                            {format(new Date(checkIn.date), "MMM d, h:mm a")}
                          </span>
                          <p className="text-foreground">{checkIn.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    No check-ins yet. Log your first one!
                  </p>
                )}
              </div>

              {/* Check-in form */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder={
                    hasCheckedInToday
                      ? "Add another update..."
                      : "What did you work on today?"
                  }
                  value={checkInText[project.id] || ""}
                  onChange={(e) =>
                    setCheckInText((prev) => ({
                      ...prev,
                      [project.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheckIn(project.id);
                  }}
                  className="bg-secondary border-border"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleCheckIn(project.id)}
                  className="border-primary/30 hover:border-primary hover:bg-primary/10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={() => handleComplete(project.id)}
                variant="outline"
                size="sm"
                className="border-accent/30 hover:border-accent hover:bg-accent/10 text-accent"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
