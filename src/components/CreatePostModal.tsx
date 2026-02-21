import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { postSchema, type PostFormValues } from "../validation/post";
import { useCategories } from "../hooks/usePosts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Plus, Image as ImageIcon, X } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MdEditor } from "md-editor-rt";
import { useCreatePost } from "../hooks/usePostCreate";

export function CreatePostModal() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    const onSubmit = (data: PostFormValues) => {
        // file state
        mutate({ ...data, file }, {
            onError: (error: any) => toast.error(error.message)
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) handleReset(); }}>
            <DialogTrigger asChild>
                <Button className="flex gap-2 dark:bg-white dark:text-black font-bold uppercase text-xs rounded-none">
                    <Plus className="w-4 h-4" /> Create Post
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#020617] dark:border-slate-800">
                <DialogHeader className="p-6 border-b dark:border-slate-800">
                    <DialogTitle className="dark:text-white uppercase font-black text-2xl tracking-tighter">Create New Post</DialogTitle>
                </DialogHeader>

                <form id="post-create-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    
                    {/* Image Upload Area */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cover Image</Label>
                        <div className="relative group border-2 border-dashed dark:border-slate-800 hover:border-slate-600 transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center p-4">
                            {previewUrl ? (
                                <div className="relative w-full">
                                    <img src={previewUrl} alt="Preview" className="max-h-[300px] w-full object-cover rounded shadow-2xl" />
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute -top-2 -right-2 rounded-full h-8 w-8 shadow-xl"
                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 cursor-pointer py-10 w-full">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full">
                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Click to upload featured image</p>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Post Title</Label>
                            <Input {...register("title")} placeholder="Headline" className={`h-12 rounded-none ${errors.title ? "border-red-500" : "dark:border-slate-800"}`} />
                            {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Category</Label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={`h-12 w-full rounded-none ${errors.categoryId ? "border-red-500" : "dark:border-slate-800"}`}>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Summary</Label>
                        <Input {...register("summary")} placeholder="Brief overview" className={`h-12 rounded-none italic ${errors.summary ? "border-red-500" : "dark:border-slate-800"}`} />
                        {errors.summary && <p className="text-[10px] text-red-500 font-bold">{errors.summary.message}</p>}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Content (Markdown)</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <div className={`border rounded-none overflow-hidden ${errors.description ? "border-red-500" : "dark:border-slate-800"}`}>
                                    <MdEditor 
                                        modelValue={field.value} 
                                        onChange={field.onChange} 
                                        preview={false} 
                                        style={{ height: '350px' }} 
                                        theme="dark"
                                    />
                                </div>
                            )}
                        />
                        {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message}</p>}
                    </div>
                </form>

                <div className="p-6 border-t dark:border-slate-800 flex justify-end gap-6 bg-slate-50 dark:bg-slate-900/20">
                    <button type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors" onClick={() => setOpen(false)}>Discard</button>
                    <Button form="post-create-form" type="submit" disabled={isPending} className="h-12 px-10 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] rounded-none shadow-2xl">
                        {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Publish Post"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}