import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import emailjs from '@emailjs/browser'; // <--- ၁။ ဒါကို ထည့်ပါ
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
import { data } from "react-router-dom";

export function CreatePostModal({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [description, setDescription] = useState("");

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
        const postTitle = formData.get("title") as string; // Title သိမ်းမယ်
        let uploadedImageUrl = "";

        try {
            // ၁။ ပုံတင်ခြင်း
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `posts/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
                uploadedImageUrl = urlData.publicUrl;
            }

            // ၂။ Post သိမ်းခြင်း (ID ပြန်ရအောင် .select().single() သုံးထားတယ်)
            const { data: newPost, error } = await supabase.from("posts").insert([{
                title: postTitle,
                summary: formData.get("summary"),
                description: description,
                category_id: selectedCategoryId,
                image_url: uploadedImageUrl,
            }]).select().single();

            if (error) throw error;

            // ၃။ Email ပို့ရန် send_emails: false သမားများကို ရှာမယ်
            const { data: profiles } = await supabase
                .from('profiles')
                .select('email')
                .eq('send_emails', false);
            console.log(data);
            
            // ၄။ EmailJS နဲ့ ပို့မယ်
            if (profiles && profiles.length > 0 && newPost) {
                profiles.forEach((user) => {
                    emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        {
                            title: postTitle,
                            post_url: `http://localhost:5173/post/${newPost.id}`,
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
                <Button className="flex gap-2"><Plus className="w-4 h-4" /> Create Post</Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold uppercase tracking-tight">Create New Post</DialogTitle>
                    <DialogDescription className="text-gray-500 text-xs">
                        Fill in the details below to publish a new blog post.
                    </DialogDescription>
                </DialogHeader>

                <form id="post-create-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider">Post Title</Label>
                        <Input name="title" required placeholder="ခေါင်းစဉ်ရေးပါ" className="h-10 border-gray-200" />
                    </div>

                    {/* Category Select */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider">Category</Label>
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                            <SelectTrigger className="h-10 w-full border-gray-200">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider">Cover Image</Label>
                        <div className="relative group">
                            <div
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl h-44 flex items-center justify-center bg-gray-50/50 overflow-hidden transition-all ${!previewUrl ? 'cursor-pointer hover:border-black' : ''}`}
                            >
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Upload className="w-6 h-6" />
                                        <span className="text-[10px] font-bold uppercase">Click to upload image</span>
                                    </div>
                                )}
                            </div>
                            {previewUrl && (
                                <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Input */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider">Summary</Label>
                        <Input name="summary" required placeholder="ပို့စ်အကျဉ်းချုပ်" className="h-10 border-gray-200" />
                    </div>

                    {/* MD Editor */}
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase tracking-wider">Content</Label>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <MdEditor
                                modelValue={description}
                                onChange={setDescription}
                                preview={false}
                                language="en-US"
                                style={{ height: '350px' }}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-gray-50/50 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-6 font-bold uppercase text-[10px]">Cancel</Button>
                    <Button form="post-create-form" type="submit" className="h-10 min-w-[140px] bg-black text-white font-bold uppercase text-[10px]" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : "Publish Post"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}