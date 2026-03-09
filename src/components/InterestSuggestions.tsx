import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { addProject } from "@/lib/projects";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SuggestedProject {
  title: string;
  description: string;
  firstStep: string;
  category: string;
}

interface InterestSuggestionsProps {
  onAdded: () => void;
}

const InterestSuggestions = ({ onAdded }: InterestSuggestionsProps) => {
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedProject[]>([]);
  const [addedIndexes, setAddedIndexes] = useState<Set<number>>(new Set());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests.trim()) {
      toast.error("Tell us what you're into first!");
      return;
    }

    setLoading(true);
    setSuggestions([]);
    setAddedIndexes(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("suggest-from-interests", {
        body: { interests: interests.trim() },
      });

      if (error || !data?.success) {
        toast.error(data?.error || error?.message || "Failed to generate suggestions");
        return;
      }

      setSuggestions(data.projects);
      toast.success("Here are some project ideas! 🎨");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong generating suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (project: SuggestedProject, index: number) => {
    addProject({
      url: "",
      title: project.title,
      description: project.description,
      firstStep: project.firstStep,
    });
    setAddedIndexes((prev) => new Set(prev).add(index));
    toast.success(`Added: ${project.title}`);
    onAdded();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleGenerate} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
          <Input
            placeholder="e.g. woodworking, React, painting, gardening..."
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="bg-secondary border-border pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !interests.trim()} className="shrink-0">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            "Suggest Projects"
          )}
        </Button>
      </form>

      <AnimatePresence mode="popLayout">
        {suggestions.map((project, i) => (
          <motion.div
            key={`${project.title}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-5 mb-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                <p className="text-xs text-accent mt-2">
                  <span className="font-semibold">First step:</span> {project.firstStep}
                </p>
              </div>
              <Button
                size="sm"
                variant={addedIndexes.has(i) ? "secondary" : "outline"}
                onClick={() => handleAdd(project, i)}
                disabled={addedIndexes.has(i)}
                className={
                  addedIndexes.has(i)
                    ? "text-accent"
                    : "border-primary/30 hover:border-primary hover:bg-primary/10"
                }
              >
                {addedIndexes.has(i) ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InterestSuggestions;
