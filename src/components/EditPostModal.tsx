import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MdEditor } from 'md-editor-rt';
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useUpdatePost } from "../hooks/useAdmin";
import { editPostSchema, type EditPostFormValues } from "../validation/editPost";
import { useCategories } from "@/hooks/usePosts";

export function EditPostModal({ post, open, setOpen }: any) {
    const updateMutation = useUpdatePost();
    const { data: categories = [] } = useCategories();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, handleSubmit, control, reset } = useForm<EditPostFormValues>({
        resolver: zodResolver(editPostSchema),
    });

    useEffect(() => {
        if (post && open) {
            reset({
                title: post.title,
                summary: post.summary,
                description: post.description,
                categoryId: post.category_id || post.categories?.id || ""
            });
            setPreviewUrl(post.image_url || null);
            setFile(null);
        }
    }, [post, reset, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };

    const onSubmit = (data: EditPostFormValues) => {
        updateMutation.mutate(
            { id: post.id, updates: data, file: file },
            {
                onSuccess: () => {
                    toast.success("ပြင်ဆင်မှု အောင်မြင်ပါသည်");
                    setOpen(false);
                },
                onError: (err: any) => toast.error(err.message)
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#020617] dark:border-slate-800 shadow-2xl">
                <DialogHeader className="p-6 border-b dark:border-slate-800">
                    <DialogTitle className="dark:text-white uppercase font-black text-2xl tracking-tighter">Edit Post</DialogTitle>
                </DialogHeader>

                <form id="post-edit-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">

                    {/* Image Area */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Post Imagery</Label>
                        <div className="relative group border-2 border-dashed dark:border-slate-800 min-h-[200px] flex flex-col items-center justify-center p-4 bg-slate-900/10">
                            {previewUrl ? (
                                <div className="relative w-full flex justify-center">
                                    <img src={previewUrl} alt="Preview" className="max-h-[300px] object-cover rounded shadow-2xl" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 rounded-full h-8 w-8" onClick={() => { setFile(null); setPreviewUrl(null); }}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 cursor-pointer py-10 w-full">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Click to upload new image</p>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Headline */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Headline</Label>
                            <Input {...register("title")} className="h-14 text-xl font-bold dark:bg-transparent rounded-none border-t-0 border-x-0 border-b dark:border-slate-800" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Category</Label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-14 rounded-none dark:bg-transparent border-t-0 border-x-0 border-b dark:border-slate-800 focus:ring-0">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Summary</Label>
                        <Input {...register("summary")} className="italic dark:bg-transparent rounded-none border-t-0 border-x-0 border-b dark:border-slate-800" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Content</Label>
                        <Controller name="description" control={control} render={({ field }) => (
                            <div className="border dark:border-slate-800 rounded-none overflow-hidden">
                                <MdEditor modelValue={field.value || ""} onChange={field.onChange} preview={false} style={{ height: '350px' }} theme="dark" language="en-US" />
                            </div>
                        )} />
                    </div>
                </form>

                <div className="p-6 border-t dark:border-slate-800 flex justify-end gap-6 bg-slate-50 dark:bg-slate-900/20">
                    <button type="button" className="text-[10px] font-black uppercase text-slate-400" onClick={() => setOpen(false)}>Discard</button>
                    <Button form="post-edit-form" type="submit" disabled={updateMutation.isPending} className="h-12 px-14 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] rounded-none">
                        {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Commit Updates"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}