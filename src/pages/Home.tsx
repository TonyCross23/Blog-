import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChevronLeft, ChevronRight, Clock, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 9;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(0);
            fetchPosts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from("posts")
            .select("*, categories(name)", { count: 'exact' });

        if (searchQuery) {
            query = query.ilike("title", `%${searchQuery}%`);
        }

        const from = currentPage * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            toast.error("Error fetching posts");
        } else {
            setPosts(data || []);
            setTotalCount(count || 0);
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Search Bar */}
            <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-10 pr-10 h-10 rounded-full border-gray-200 focus-visible:ring-black shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-gray-400 hover:text-black" />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-video bg-gray-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-fit"
                                onClick={() => navigate(`/post/${post.id}`)}
                            >
                                {/* ၁။ Image & Category Badge (ဘယ်ဘက်အပေါ်မှာ ပိုကြီးကြီးထားထားတယ်) */}
                                <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                                    {post.image_url ? (
                                        <img
                                            src={post.image_url}
                                            alt="Post Image"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">NO IMAGE</div>
                                    )}

                                    {/* Category Badge - Bigger & Positioned Left-Top */}
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-black text-white text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg">
                                            {post.categories?.name || "GENERAL"}
                                        </span>
                                    </div>
                                </div>

                                {/* ၂။ Content Section */}
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed flex-1 italic">
                                            {post.summary}
                                        </p>
                                        <div className="flex items-center text-[10px] text-gray-400 whitespace-nowrap pt-1 font-semibold">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    {/* ၃။ Read More - ဘယ်ဘက်အစွန်းဆုံးကို ကပ်သွားအောင် px-0 နဲ့ လုပ်ထားတယ် */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-start text-[10px] font-black text-black group-hover:text-blue-600 transition-colors uppercase tracking-widest -ml-0.5">
                                            Read more <ChevronRight className="w-3 h-3 ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-12">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 rounded-full border-gray-200"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                {currentPage + 1} / {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 rounded-full border-gray-200"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage + 1 >= totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}