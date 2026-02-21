import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 8;

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("*").order("name");
        setCategories(data || []);
    };

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const from = currentPage * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase
            .from("posts")
            .select("id, summary, created_at, image_url, category_id, categories(name)", { count: 'exact' });

        if (selectedCategory !== "all") {
            query = query.eq("category_id", selectedCategory);
        }

        if (searchQuery) {
            query = query.ilike("summary", `%${searchQuery}%`);
        }

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
    }, [currentPage, searchQuery, selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen transition-colors duration-300">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className={`rounded-full text-[11px] font-bold px-5 h-8 transition-all ${selectedCategory === "all"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "border-gray-100 text-gray-500 dark:border-slate-800 dark:text-gray-400 hover:dark:bg-slate-900"
                        }`}
                    onClick={() => setSelectedCategory("all")}
                >
                    All
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className={`rounded-full text-[11px] font-bold px-5 h-8 whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "border-gray-100 text-gray-500 dark:border-slate-800 dark:text-gray-400 hover:dark:bg-slate-900"
                            }`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(itemsPerPage)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-50 dark:bg-slate-900/50 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group flex flex-col bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-500 cursor-pointer h-full"
                                    onClick={() => navigate(`/post/${post.id}`)}
                                >
                                    {/* Image Section */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-slate-900">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 dark:text-slate-700">NO IMAGE</div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-black dark:text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">
                                                {post.categories?.name || "GENERAL"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 flex flex-col flex-1 gap-3">
                                        <p className="text-[15px] text-gray-800 dark:text-slate-200 font-semibold line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">
                                            {post.summary}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-900 mt-auto">
                                            <div className="flex items-center text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                                                <Clock className="w-3 h-3 mr-1.5" />
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-black dark:text-slate-300 group-hover:translate-x-1 transition-transform">
                                                Read <ChevronRight className="w-3 h-3 inline ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-gray-50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                            <p className="text-gray-400 dark:text-slate-600 text-sm font-medium italic">No posts found in this universe.</p>
                        </div>
                    )}

                    {/* Pagination - Premium Dark Style */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-16">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-400"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {[...Array(totalPages)].map((_, index) => {
                                if (index === 0 || index === totalPages - 1 || (index >= currentPage - 1 && index <= currentPage + 1)) {
                                    return (
                                        <Button
                                            key={index}
                                            variant={currentPage === index ? "default" : "outline"}
                                            size="sm"
                                            className={`h-9 w-9 text-[11px] font-black rounded-xl transition-all duration-300 ${currentPage === index
                                                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none"
                                                    : "text-gray-400 border-gray-100 dark:border-slate-800 dark:text-slate-500 hover:dark:bg-slate-900"
                                                }`}
                                            onClick={() => setCurrentPage(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    );
                                }
                                if (index === currentPage - 2 || index === currentPage + 2) {
                                    return <span key={index} className="px-1 text-gray-300 dark:text-slate-700">...</span>;
                                }
                                return null;
                            })}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-400"
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