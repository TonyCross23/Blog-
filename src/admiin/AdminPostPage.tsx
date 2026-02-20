import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Pencil, Trash2, Users, FileText, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"; 
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { CreatePostModal } from "../components/CreatePostModal";
import { Card, CardContent } from "../components/ui/card";

interface Post {
    id: string;
    summary: string;
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
                .select("id, summary, created_at, categories(name)", { count: 'exact' })
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

    // --- ဖျက်မယ့် Function အသစ် ---
    const deletePost = async (id: string) => {
        if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာသလား?")) return;

        try {
            const { error } = await supabase.from("posts").delete().eq("id", id);
            if (error) throw error;

            toast.success("ဖျက်ပြီးပါပြီ");
            
            // Post တစ်ခုဖျက်ပြီးရင် အဲ့ဒီ Page မှာ data ကျန်သေးလား စစ်မယ်
            // တကယ်လို့ နောက်ဆုံးတစ်ခုကို ဖျက်လိုက်တာဆိုရင် ရှေ့ page ကို ပြန်သွားမယ်
            if (posts.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchData(); // ပုံမှန်ဆိုရင် data ကို refresh လုပ်ရုံပဲ
            }
        } catch (error: any) {
            toast.error("ဖျက်လို့မရပါ: " + error.message);
        }
    };
    // ----------------------------

    const totalPages = Math.ceil(postCount / itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                <div className="flex gap-3">
                    <CreateCategoryModal onCreated={fetchData} />
                    <CreatePostModal onCreated={fetchData} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-blue-50/80">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-blue-600 uppercase">Total Posts</p>
                            <p className="text-3xl font-black text-slate-900">{postCount}</p>
                        </div>
                        <div className="p-4 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <FileText className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50/80">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-purple-600 uppercase">Total Users</p>
                            <p className="text-3xl font-black text-slate-900">{userCount}</p>
                        </div>
                        <div className="p-4 bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-200">
                            <Users className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[450px] font-bold">Summary</TableHead>
                            <TableHead className="font-bold">Category</TableHead>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-10 animate-pulse">Loading data...</TableCell></TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-10">No posts found.</TableCell></TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id} className="hover:bg-slate-50/30">
                                    <TableCell className="font-medium text-slate-700">{post.summary}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="rounded-lg">{post.categories?.name || "None"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" className="rounded-full hover:text-blue-600">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        {/* Click Event ထည့်လိုက်တဲ့ Trash Button */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-full hover:text-red-600" 
                                            onClick={() => deletePost(post.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </p>
                    
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {getPageNumbers().map((page, index) => (
                            page === "..." ? (
                                <MoreHorizontal key={index} className="w-4 h-4 text-slate-300 mx-1" />
                            ) : (
                                <Button
                                    key={index}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(Number(page))}
                                    className={`w-8 h-8 rounded-lg font-bold ${currentPage === page ? "bg-black text-white" : "text-slate-600"}`}
                                >
                                    {page}
                                </Button>
                            )
                        ))}

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="rounded-lg"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}