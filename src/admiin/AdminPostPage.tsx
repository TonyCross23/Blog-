import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { CreatePostModal } from "../components/CreatePostModal";

interface Post {
    id: string;
    summary: string;
    created_at: string;
    categories: { name: string };
}

export default function AdminPostPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("posts")
            .select("id, summary, created_at, categories(name)")
            .order("created_at", { ascending: false });
        
        if (error) toast.error("Data ဆွဲလို့မရပါ");
        else setPosts(data as any);
        setLoading(false);
    };

    const deletePost = async (id: string) => {
        if (!confirm("ဒီ Post ကို ဖျက်မှာ သေချာသလား?")) return;
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) toast.error("ဖျက်လို့မရပါ");
        else {
            toast.success("ဖျက်ပြီးပါပြီ");
            fetchPosts();
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post Management</h1>
                </div>

                <div className="flex gap-3">
                    <CreateCategoryModal onCreated={fetchPosts} />
                    <CreatePostModal onCreated={fetchPosts} />
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[400px]">Summary</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center">ပို့စ်များ မရှိသေးပါ။</TableCell></TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.summary}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {post.categories?.name || "Uncategorized"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="hover:text-blue-600">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-red-600" onClick={() => deletePost(post.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}