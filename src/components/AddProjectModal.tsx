import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Link as LinkIcon } from "lucide-react";
import { addProject, extractProjectFromUrl } from "@/lib/projects";
import { toast } from "sonner";

interface AddProjectModalProps {
  onAdded: () => void;
}

const AddProjectModal = ({ onAdded }: AddProjectModalProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [firstStep, setFirstStep] = useState("");
  const [extracted, setExtracted] = useState(false);

  const handleUrlPaste = (value: string) => {
    setUrl(value);
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const info = extractProjectFromUrl(value);
      setTitle(info.title);
      setDescription(info.description);
      setFirstStep(info.firstStep);
      setExtracted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give your project a title!");
      return;
    }
    addProject({
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
      firstStep: firstStep.trim() || "Open the link and get started!",
    });
    toast.success("Project added! One less excuse.");
    setUrl("");
    setTitle("");
    setDescription("");
    setFirstStep("");
    setExtracted(false);
    setOpen(false);
    onAdded();
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
          <DialogTitle className="text-gradient-fire text-xl">Add a Project Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">Paste a link</label>
            </div>
            <Input
              placeholder="https://instagram.com/p/..."
              value={url}
              onChange={(e) => handleUrlPaste(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          {extracted && (
            <p className="text-xs text-accent">✨ Auto-detected! Edit the details below if needed.</p>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Project title</label>
            <Input
              placeholder="My awesome project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Description</label>
            <Textarea
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">First step to get started</label>
            <Input
              placeholder="e.g. Buy materials from the store"
              value={firstStep}
              onChange={(e) => setFirstStep(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <Button type="submit" className="w-full">
            Save Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
