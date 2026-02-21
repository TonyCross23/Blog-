import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MdEditor } from 'md-editor-rt';
import { Loader2 } from "lucide-react";
import 'md-editor-rt/lib/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useUpdatePost } from "../hooks/useAdmin";
import { editPostSchema, type EditPostFormValues } from "../validation/editPost";

export function EditPostModal({ post, open, setOpen }: any) {
    // TanStack Query Hook
    const updateMutation = useUpdatePost();

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<EditPostFormValues>({
        resolver: zodResolver(editPostSchema),
        defaultValues: {
            title: "",
            summary: "",
            description: ""
        }
    });

    useEffect(() => {
        if (post) {
            reset({
                title: post.title,
                summary: post.summary,
                description: post.description
            });
        }
    }, [post, reset]);

    const description = watch("description");

    const onSubmit = (data: EditPostFormValues) => {
        updateMutation.mutate(
            { id: post.id, updates: data },
            {
                onSuccess: () => {
                    toast.success("Post ပြင်ဆင်ပြီးပါပြီ");
                    setOpen(false);
                },
                onError: (err: any) => toast.error(err.message)
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 dark:bg-[#020617] border-none">
                <DialogHeader className="p-6 border-b dark:border-slate-800">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Edit Post</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase text-slate-400">
                        Adjust your post details below and commit changes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Title</Label>
                        <Input 
                            {...register("title")} 
                            className={`h-14 text-xl font-bold dark:bg-transparent rounded-none border-t-0 border-x-0 border-b ${errors.title ? 'border-red-500' : 'dark:border-slate-800'}`} 
                        />
                        {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.title.message}</p>}
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Summary</Label>
                        <Input 
                            {...register("summary")} 
                            className={`italic dark:bg-transparent rounded-none border-t-0 border-x-0 border-b ${errors.summary ? 'border-red-500' : 'dark:border-slate-800'}`} 
                        />
                        {errors.summary && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.summary.message}</p>}
                    </div>

                    {/* Description (MdEditor) */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Content</Label>
                        <div className={`border rounded-none overflow-hidden ${errors.description ? 'border-red-500' : 'dark:border-slate-800'}`}>
                            <MdEditor 
                                modelValue={description} 
                                onChange={(val) => setValue("description", val, { shouldValidate: true })} 
                                language="en-US" 
                                style={{ height: '400px' }} 
                            />
                        </div>
                        {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.description.message}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-6 items-center pt-4">
                        <button type="button" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">
                            Discard
                        </button>
                        <Button 
                            type="submit" 
                            disabled={updateMutation.isPending}
                            className="h-12 px-12 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] rounded-none"
                        >
                            {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Commit Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}