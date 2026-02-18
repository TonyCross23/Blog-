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
        <Button variant="outline" className="flex gap-2">
          <LayoutGrid className="w-4 h-4" /> New Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Technology" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}