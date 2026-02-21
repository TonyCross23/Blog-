import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LayoutGrid } from "lucide-react";

export function CreateCategoryModal({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("categories").insert([{ name }]);
    
    if (error) toast.error(error.message);
    else {
      toast.success("Category created!");
      setName("");
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20">
          <LayoutGrid className="w-4 h-4" /> New Category
        </Button>
      </DialogTrigger>
      
      <DialogContent className="dark:bg-[#020617] dark:border-slate-800" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Add New <span className="text-blue-600 dark:text-blue-400">Category</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="dark:text-slate-300">Category Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Technology" 
              required 
              className="dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-blue-500"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}