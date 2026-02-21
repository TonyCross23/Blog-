import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Upload, Loader2, X } from "lucide-react";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

export function CreatePostModal({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [description, setDescription] = useState("");

    const isDark = document.documentElement.classList.contains('dark');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            supabase.from("categories").select("*").order("name").then(({ data }) => setCategories(data || []));
        } else {
            handleReset();
        }
    }, [open]);

    const handleReset = () => {
        setFile(null);
        setPreviewUrl(null);
        setSelectedCategoryId("");
        setDescription("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!description) return toast.error("Content ရေးပေးရန် လိုအပ်ပါသည်။");
        if (!selectedCategoryId) return toast.error("Category ရွေးပေးရန် လိုအပ်ပါသည်။");

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const postTitle = formData.get("title") as string;
        let uploadedImageUrl = "";

        try {
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `posts/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
                uploadedImageUrl = urlData.publicUrl;
            }

            const { data: newPost, error } = await supabase.from("posts").insert([{
                title: postTitle,
                summary: formData.get("summary"),
                description: description,
                category_id: selectedCategoryId,
                image_url: uploadedImageUrl,
            }]).select().single();

            if (error) throw error;

            const { data: profiles } = await supabase
                .from('profiles')
                .select('email')
                .eq('send_emails', false);
            
            if (profiles && profiles.length > 0 && newPost) {
                profiles.forEach((user) => {
                    emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        {
                            title: postTitle,
                            post_url: `${window.location.origin}/post/${newPost.id}`,
                            to_email: user.email,
                        },
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                    );
                });
            }

            toast.success("ပို့စ်အသစ် တင်ပြီးပါပြီ။ Email များလည်း ပို့ပေးလိုက်ပါပြီ။");
            setOpen(false);
            onCreated();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "တင်လို့မရပါ၊ တစ်ခုခုမှားနေသည်။");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                    <Plus className="w-4 h-4" /> Create Post
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#020617] dark:border-slate-800 transition-all">
                <DialogHeader className="p-6 border-b dark:border-slate-800">
                    <DialogTitle className="text-2xl font-bold uppercase tracking-tight dark:text-white">Create New Post</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-slate-400 text-xs">
                        Fill in the details below to publish a new blog post.
                    </DialogDescription>
                </DialogHeader>

                <form id="post-create-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin dark:scrollbar-thumb-slate-800">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider dark:text-slate-300">Post Title</Label>
                        <Input name="title" required placeholder="ခေါင်းစဉ်ရေးပါ" 
                            className="h-10 border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus:ring-slate-700" 
                        />
                    </div>

                    {/* Category Select */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider dark:text-slate-300">Category</Label>
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                            <SelectTrigger className="h-10 w-full border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-950 dark:border-slate-800">
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className="dark:text-white dark:focus:bg-slate-900">{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider dark:text-slate-300">Cover Image</Label>
                        <div className="relative group">
                            <div
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl h-44 flex items-center justify-center overflow-hidden transition-all
                                    ${!previewUrl 
                                        ? 'cursor-pointer bg-gray-50/50 hover:border-black dark:bg-slate-900/30 dark:border-slate-800 dark:hover:border-slate-500' 
                                        : 'border-transparent'}`}
                            >
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-600">
                                        <Upload className="w-6 h-6" />
                                        <span className="text-[10px] font-bold uppercase">Click to upload image</span>
                                    </div>
                                )}
                            </div>
                            {previewUrl && (
                                <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Input */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider dark:text-slate-300">Summary</Label>
                        <Input name="summary" required placeholder="ပို့စ်အကျဉ်းချုပ်" 
                            className="h-10 border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-white" 
                        />
                    </div>

                    {/* MD Editor */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider dark:text-slate-300">Content</Label>
                        <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all">
                            <MdEditor
                                modelValue={description}
                                onChange={setDescription}
                                preview={false}
                                language="en-US"
                                theme={isDark ? 'dark' : 'light'}
                                style={{ height: '350px' }}
                                className="dark:!bg-slate-900"
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-gray-50/50 dark:bg-slate-950/50 dark:border-slate-800 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} 
                        className="h-10 px-6 font-bold uppercase text-[10px] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900">
                        Cancel
                    </Button>
                    <Button form="post-create-form" type="submit" 
                        className="h-10 min-w-[140px] bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-[10px] dark:hover:bg-slate-200" 
                        disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : "Publish Post"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}