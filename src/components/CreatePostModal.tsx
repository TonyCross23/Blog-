import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Upload, Loader2, X } from "lucide-react";

export function CreatePostModal({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Select Value အတွက် State
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

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
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        let uploadedImageUrl = "";

        try {
            // ၁။ ပုံကို 'images' bucket ထဲ တင်ခြင်း
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `posts/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
                uploadedImageUrl = urlData.publicUrl;
            }

            // ၂။ Database ထဲသို့ Post ထည့်ခြင်း
            // သတိပြုရန်: image_url သည် Database ထဲက column name အတိုင်း ဖြစ်ရပါမည်
            const { error } = await supabase.from("posts").insert([{
                title: formData.get("title"),
                summary: formData.get("summary"),
                description: formData.get("description"),
                category_id: selectedCategoryId, // State မှ တိုက်ရိုက်ယူသည်
                image_url: uploadedImageUrl,     // Database column အမည်
            }]);

            if (error) throw error;

            toast.success("ပို့စ်အသစ် တင်ပြီးပါပြီ။");
            setOpen(false);
            onCreated();
        } catch (error: any) {
            console.error("Supabase Error:", error);
            toast.error(error.message || "Data သိမ်းဆည်းရာတွင် အမှားရှိနေပါသည်။");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex gap-2"><Plus className="w-4 h-4" /> Create Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-none">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold pt-2">Create New Post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Post Title</Label>
                            <Input id="title" name="title" required placeholder="ခေါင်းစဉ်ရေးပါ" className="focus-visible:ring-black" />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                                <SelectTrigger className="focus:ring-black">
                                    <SelectValue placeholder="Category ရွေးပါ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div
                            className="relative border-2 border-dashed rounded-2xl min-h-[220px] flex items-center justify-center bg-gray-50/30 hover:bg-gray-50 transition-all group cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {previewUrl ? (
                                <div className="relative w-full h-full p-3">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full aspect-video object-cover rounded-xl shadow-md"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-6 right-6 h-8 w-8 rounded-full z-20 shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <p className="bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-black shadow-sm">Change Image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-gray-100">
                                        <Upload className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">Click to upload cover image</p>
                                    <p className="text-xs text-gray-400 mt-2">Recommended: 1200 x 630px (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Input id="summary" name="summary" required placeholder="ပို့စ်အကြောင်း အကျဉ်းချုပ် ရေးသားပေးပါ" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Content Description</Label>
                        <Textarea id="description" name="description" rows={8} required placeholder="အကြောင်းအရာ အပြည့်အစုံကို ဤနေရာတွင် ရေးသားပေးပါ..." className="resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="min-w-[150px] bg-black text-white hover:bg-gray-800" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Post"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}