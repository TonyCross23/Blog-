import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Pencil, Trash2, Users, FileText, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { CreatePostModal } from "../components/CreatePostModal";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

interface Post {
    id: string;
    title: string;
    summary: string;
    description: string;
    created_at: string;
    categories: { name: string };
}

export default function AdminPostPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postCount, setPostCount] = useState(0);
    const [userCount, setUserCount] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [editForm, setEditForm] = useState({ title: "", summary: "", description: "" });

    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            const { data, count, error: pError } = await supabase
                .from("posts")
                .select("id, title, summary, description, created_at, categories(name)", { count: 'exact' })
                .order("created_at", { ascending: false })
                .range(from, to);

            const { count: uCount, error: uError } = await supabase
                .from("profiles")
                .select("*", { count: 'exact', head: true });

            if (pError || uError) throw new Error();

            setPosts(data as any);
            setPostCount(count || 0);
            setUserCount(uCount || 0);
        } catch (error) {
            toast.error("ဒေတာ ဆွဲယူမရပါ");
        } finally {
            setLoading(false);
        }
    };

    const handleEditOpen = (post: Post) => {
        setSelectedPost(post);
        setEditForm({
            title: post.title || "",
            summary: post.summary || "",
            description: post.description || ""
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedPost) return;
        setEditLoading(true);
        try {
            const { error } = await supabase
                .from("posts")
                .update({
                    title: editForm.title,
                    summary: editForm.summary,
                    description: editForm.description
                })
                .eq("id", selectedPost.id);

            if (error) throw error;

            toast.success("ပြင်ဆင်ပြီးပါပြီ");
            setIsEditOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error("ပြင်လို့မရပါ: " + error.message);
        } finally {
            setEditLoading(false);
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာသလား?")) return;

        try {
            const { error } = await supabase.from("posts").delete().eq("id", id);
            if (error) throw error;
            toast.success("ဖျက်ပြီးပါပြီ");
            fetchData();
        } catch (error: any) {
            toast.error("ဖျက်လို့မရပါ: " + error.message);
        }
    };

    const totalPages = Math.ceil(postCount / itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages.length > 0 && pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
            <div className="container mx-auto p-6 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Dashboard</h1>
                        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Management & Analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <CreateCategoryModal onCreated={fetchData} />
                        <CreatePostModal onCreated={fetchData} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-[#0f172a] dark:border-slate-800">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Posts</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white">{postCount}</p>
                            </div>
                            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-full text-blue-500">
                                <FileText className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white dark:bg-[#0f172a] dark:border-slate-800">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Active Users</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white">{userCount}</p>
                            </div>
                            <div className="p-4 bg-purple-500/10 dark:bg-purple-500/20 rounded-full text-purple-500">
                                <Users className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Section */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-none bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow className="border-slate-200 dark:border-slate-800">
                                <TableHead className="w-[450px] font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Content Summary</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Category</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Created At</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Manage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse text-slate-400 uppercase text-xs font-bold tracking-widest">Syncing Data...</TableCell></TableRow>
                            ) : posts.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-400 uppercase text-xs font-bold tracking-widest">Database Empty</TableCell></TableRow>
                            ) : (
                                posts.map((post) => (
                                    <TableRow key={post.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4">{post.summary}</TableCell>
                                        <TableCell>
                                            <Badge className="rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none px-3 font-bold text-[10px] uppercase">
                                                {post.categories?.name || "Uncategorized"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-500">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-none hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:text-slate-400 dark:hover:text-blue-400"
                                                    onClick={() => handleEditOpen(post)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-none hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-400"
                                                    onClick={() => deletePost(post.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-8 py-6 border-t dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page {currentPage} / {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="rounded-none dark:bg-transparent dark:border-slate-800 dark:text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {getPageNumbers().map((page, index) => (
                                page === "..." ? (
                                    <MoreHorizontal key={index} className="w-4 h-4 text-slate-300" />
                                ) : (
                                    <Button
                                        key={index}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(Number(page))}
                                        className={`w-10 h-10 rounded-none font-black text-[10px] transition-all ${currentPage === page ? "bg-black text-white dark:bg-white dark:text-black" : "dark:bg-transparent dark:border-slate-800 dark:text-slate-400"}`}
                                    >
                                        {page}
                                    </Button>
                                )
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="rounded-none dark:bg-transparent dark:border-slate-800 dark:text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Edit Modal (Integrated Style) */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent
                        aria-describedby={undefined}
                        className="max-w-5xl w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#020617] dark:border-slate-800 border-none shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 bg-white dark:bg-[#020617]">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter dark:text-white">Edit Post</DialogTitle>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Revise your content carefully</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-[#020617] scrollbar-hide">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 ml-1">Headline</Label>
                                <Input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="h-14 bg-transparent border-slate-200 dark:border-slate-800 dark:text-white text-xl font-bold focus-visible:ring-1 focus-visible:ring-slate-400 rounded-none border-t-0 border-x-0 px-1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 ml-1">Summary</Label>
                                <Input
                                    value={editForm.summary}
                                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                                    className="h-12 bg-transparent border-slate-200 dark:border-slate-800 dark:text-white focus-visible:ring-1 focus-visible:ring-slate-400 rounded-none border-t-0 border-x-0 px-1 italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 ml-1">Markdown Content</Label>
                                <div className="border dark:border-slate-800 rounded-none overflow-hidden">
                                    <MdEditor
                                        modelValue={editForm.description}
                                        onChange={(val) => setEditForm({ ...editForm, description: val })}
                                        theme={isDark ? 'dark' : 'light'}
                                        language="en-US"
                                        style={{ height: '450px' }}
                                        preview={false}
                                        className="dark:!bg-[#020617]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-[#020617] flex justify-end items-center gap-6">
                            <button onClick={() => setIsEditOpen(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors">Discard</button>
                            <Button
                                onClick={handleUpdate}
                                disabled={editLoading}
                                className="h-12 px-12 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-none shadow-2xl"
                            >
                                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commit Changes"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}