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
        <div className="container mx-auto px-4 py-8">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className={`rounded-full text-[11px] font-bold px-4 h-8 transition-all ${
                        selectedCategory === "all" ? "bg-black text-white" : "border-gray-100 text-gray-500"
                    }`}
                    onClick={() => setSelectedCategory("all")}
                >
                    All
                </Button>
                {categories.map((cat) => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className={`rounded-full text-[11px] font-bold px-4 h-8 whitespace-nowrap transition-all ${
                            selectedCategory === cat.id ? "bg-black text-white" : "border-gray-100 text-gray-500"
                        }`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(itemsPerPage)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full"
                                    onClick={() => navigate(`/post/${post.id}`)}
                                >
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">NO IMAGE</div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-white/90 backdrop-blur-sm text-black text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                {post.categories?.name || "GENERAL"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-1 gap-2">
                                        <p className="text-[15px] text-gray-700 font-medium line-clamp-2 leading-tight">
                                            {post.summary}
                                        </p>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center text-[8px] text-gray-400 font-bold uppercase">
                                                <Clock className="w-2.5 h-2.5 mr-1" />
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </div>
                                            <div className="text-[9px] font-black uppercase text-black group-hover:text-gray-600 transition-colors">
                                                Read more... <ChevronRight className="w-2.5 h-2.5 inline" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                            <p className="text-gray-400 text-sm italic">No posts found.</p>
                        </div>
                    )}

                    {/* Pagination - Compact Style */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-1 mt-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
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
                                            className={`h-8 w-8 text-[10px] font-bold rounded-lg transition-all ${
                                                currentPage === index ? "bg-black text-white" : "text-gray-400 border-gray-100"
                                            }`}
                                            onClick={() => setCurrentPage(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    );
                                }
                                if (index === currentPage - 2 || index === currentPage + 2) {
                                    return <span key={index} className="px-1 text-gray-300 text-[10px]">...</span>;
                                }
                                return null;
                            })}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
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