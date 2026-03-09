import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";
import { addProject } from "@/lib/projects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddProjectModalProps {
  onAdded: () => void;
}

const AddProjectModal = ({ onAdded }: AddProjectModalProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error("Paste a link first!");
      return;
    }

    // Ensure it's a valid URL
    let finalUrl = trimmedUrl;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-link", {
        body: { url: finalUrl },
      });

      if (error || !data?.success) {
        const msg = data?.error || error?.message || "Failed to analyze link";
        toast.error(msg);
        return;
      }

      const { project } = data;
      addProject({
        url: finalUrl,
        title: project.title,
        description: project.description,
        firstStep: project.firstStep,
      });

      toast.success(`Added: ${project.title}`);
      setUrl("");
      setOpen(false);
      onAdded();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong analyzing this link.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10">
          <Plus className="w-5 h-5" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient-fire text-xl">Add a Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">Paste any link</label>
            </div>
            <Input
              placeholder="https://instagram.com/p/... or any URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-secondary border-border"
              disabled={analyzing}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>AI will analyze the link and identify the project for you</span>
          </div>
          <Button type="submit" className="w-full" disabled={analyzing || !url.trim()}>
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Add Project"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
