import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

export function EditPostModal({ post, open, setOpen, onUpdated }: any) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setSummary(post.summary || "");
            setDescription(post.description || "");
        }
    }, [post]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("posts")
                .update({ title, summary, description })
                .eq("id", post.id);

            if (error) throw error;

            toast.success("Post updated successfully!");
            setOpen(false);
            onUpdated();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto space-y-4 p-1">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Summary</Label>
                        <Input value={summary} onChange={(e) => setSummary(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <MdEditor modelValue={description} onChange={setDescription} language="en-US" style={{ height: '400px' }} />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Update Post"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}