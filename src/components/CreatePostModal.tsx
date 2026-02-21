import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { postSchema, type PostFormValues } from "../validation/post";
import { useCategories } from "../hooks/usePosts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Plus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MdEditor } from "md-editor-rt";
import { useCreatePost } from "../hooks/usePostCreate";

export function CreatePostModal() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ၁။ React Hook Form setup
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: { title: "", summary: "", description: "", categoryId: "" }
    });

    const { data: categories = [] } = useCategories();
    
    const { mutate, isPending } = useCreatePost(() => {
        toast.success("ပို့စ်အသစ် တင်ပြီးပါပြီ။");
        setOpen(false);
        handleReset();
    });

    const handleReset = () => {
        reset();
        setFile(null);
        setPreviewUrl(null);
    };

    const onSubmit = (data: PostFormValues) => {
        mutate({ ...data, file }, {
            onError: (error: any) => toast.error(error.message)
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) handleReset(); }}>
            <DialogTrigger asChild>
                <Button className="flex gap-2 dark:bg-white dark:text-black">
                    <Plus className="w-4 h-4" /> Create Post
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#020617] dark:border-slate-800">
                <DialogHeader className="p-6 border-b dark:border-slate-800">
                    <DialogTitle className="dark:text-white uppercase font-bold">Create New Post</DialogTitle>
                </DialogHeader>

                <form id="post-create-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    
                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase dark:text-slate-300">Post Title</Label>
                        <Input {...register("title")} placeholder="ခေါင်းစဉ်ရေးပါ" className={errors.title ? "border-red-500" : ""} />
                        {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
                    </div>

                    {/* Category - Using Controller for Select */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase dark:text-slate-300">Category</Label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Category ရွေးပါ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoryId && <p className="text-[10px] text-red-500 font-bold">{errors.categoryId.message}</p>}
                    </div>

                    {/* Image Area - (Keep your existing image preview JSX here) */}

                    {/* Summary */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase dark:text-slate-300">Summary</Label>
                        <Input {...register("summary")} placeholder="အကျဉ်းချုပ်" className={errors.summary ? "border-red-500" : ""} />
                        {errors.summary && <p className="text-[10px] text-red-500 font-bold">{errors.summary.message}</p>}
                    </div>

                    {/* Content - Using Controller for MdEditor */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase dark:text-slate-300">Content</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <div className={`border rounded-lg overflow-hidden ${errors.description ? "border-red-500" : "dark:border-slate-800"}`}>
                                    <MdEditor 
                                        modelValue={field.value} 
                                        onChange={field.onChange} 
                                        preview={false} 
                                        style={{ height: '350px' }} 
                                    />
                                </div>
                            )}
                        />
                        {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message}</p>}
                    </div>
                </form>

                <div className="p-6 border-t dark:border-slate-800 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button form="post-create-form" type="submit" disabled={isPending} className="bg-black text-white dark:bg-white dark:text-black">
                        {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Publish Post"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}