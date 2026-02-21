import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LayoutGrid, Loader2 } from "lucide-react";
import { useCreateCategory } from "../hooks/useCategories";
import { useState } from "react";
import { categorySchema, type CategoryFormValues } from "../validation/category";

export function CreateCategoryModal() {
  const [open, setOpen] = useState(false);

  // Hook Form Initializing
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Mutation Hook
  const { mutate, isPending } = useCreateCategory(() => {
    toast.success("Category created!");
    reset();
    setOpen(false);
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutate(data.name, {
      onError: (error: any) => {
        toast.error(error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) reset(); }}>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="dark:text-slate-300">Category Name</Label>
            <Input 
              {...register("name")}
              placeholder="e.g. Technology" 
              className={`dark:bg-slate-900 dark:border-slate-800 dark:text-white focus-visible:ring-blue-500 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {/* Error Message */}
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-bold" 
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Category"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}