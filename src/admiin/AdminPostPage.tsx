import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Users, FileText, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { CreatePostModal } from "../components/CreatePostModal";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { useAdminStats, useAdminPosts, useUpdatePost, useDeletePost } from "../hooks/useAdmin";
import { StatCard } from "../components/StatCard";

export default function AdminPostPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const { data: stats } = useAdminStats();
    const { data: postData, isLoading: loading } = useAdminPosts(currentPage, itemsPerPage);
    const updateMutation = useUpdatePost();
    const deleteMutation = useDeletePost();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [editForm, setEditForm] = useState({ title: "", summary: "", description: "" });

    const handleEditOpen = (post: any) => {
        setSelectedPost(post);
        setEditForm({ title: post.title, summary: post.summary, description: post.description });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedPost) return;
        updateMutation.mutate({ id: selectedPost.id, updates: editForm }, {
            onSuccess: () => {
                toast.success("ပြင်ဆင်ပြီးပါပြီ");
                setIsEditOpen(false);
            },
            onError: (error: any) => toast.error("ပြင်လို့မရပါ: " + error.message)
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာသလား?")) return;
        deleteMutation.mutate(id, {
            onSuccess: () => toast.success("ဖျက်ပြီးပါပြီ"),
            onError: (error: any) => toast.error("ဖျက်လို့မရပါ: " + error.message)
        });
    };

    // Pagination Logic
    const totalPages = Math.ceil((postData?.totalCount || 0) / itemsPerPage);
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300 py-12 px-6 font-sans">
            <div className="container mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Dashboard</h1>
                        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Management & Analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <CreateCategoryModal />
                        <CreatePostModal />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Total Posts" value={postData?.totalCount} icon={<FileText />} color="blue" />
                    <StatCard title="Active Users" value={stats?.userCount} icon={<Users />} color="purple" />
                </div>

                {/* Table & Pagination Container */}
                <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow className="border-slate-200 dark:border-slate-800">
                                <TableHead className="font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Summary</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Category</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-wider dark:text-slate-400">Manage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-20 animate-pulse text-slate-400 uppercase text-xs font-bold tracking-widest">Syncing Data...</TableCell></TableRow>
                            ) : (
                                postData?.posts.map((post: any) => (
                                    <TableRow key={post.id} className="border-slate-100 dark:border-slate-800/50">
                                        <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4">{post.summary}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="rounded-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-black">{post.categories?.name || "Uncategorized"}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditOpen(post)}><Pencil className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="px-8 py-6 border-t dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0f172a]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-none dark:border-slate-800"><ChevronLeft className="w-4 h-4" /></Button>

                            {getPageNumbers().map((page, index) => (
                                page === "..." ? (
                                    <MoreHorizontal key={index} className="w-4 h-4 text-slate-300" />
                                ) : (
                                    <Button
                                        key={index}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(Number(page))}
                                        className={`w-10 h-10 rounded-none font-black text-[10px] ${currentPage === page ? "bg-black text-white dark:bg-white dark:text-black" : "dark:border-slate-800 text-slate-400"}`}
                                    >
                                        {page}
                                    </Button>
                                )
                            ))}

                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="rounded-none dark:border-slate-800"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 dark:bg-[#020617] dark:border-slate-800 border-none">
                        <div className="p-6 border-b dark:border-slate-800">
                            <DialogTitle className="text-2xl font-black uppercase dark:text-white">Edit Post</DialogTitle>
                            <DialogDescription className="text-[10px] uppercase font-bold text-slate-400">Update the post details below. Changes are permanent after committing.</DialogDescription>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Headline</Label>
                                <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="h-14 text-xl font-bold dark:bg-transparent rounded-none border-t-0 border-x-0 border-b border-slate-200 dark:border-slate-800 focus-visible:ring-0" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Summary</Label>
                                <Input value={editForm.summary} onChange={e => setEditForm({ ...editForm, summary: e.target.value })} className="italic dark:bg-transparent rounded-none border-t-0 border-x-0 border-b border-slate-200 dark:border-slate-800 focus-visible:ring-0" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Markdown Content</Label>
                                <div className="border dark:border-slate-800 rounded-none overflow-hidden">
                                    <MdEditor modelValue={editForm.description} onChange={val => setEditForm({ ...editForm, description: val })} theme={isDark ? 'dark' : 'light'} style={{ height: '400px' }} preview={false} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t dark:border-slate-800 flex justify-end gap-6 items-center">
                            <button onClick={() => setIsEditOpen(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors">Discard</button>
                            <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="h-12 px-12 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-none shadow-2xl">
                                {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Commit Changes"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}