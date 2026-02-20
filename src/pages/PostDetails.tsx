import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { ChevronLeft, Clock, Share2, Bookmark } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

export default function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetails = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("posts")
                    .select("*, categories(name)")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setPost(data);
            } catch (error: any) {
                toast.error("Post ရှာမတွေ့ပါ");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPostDetails();
    }, [id, navigate]);

    const handleShare = async () => {
        const shareData = {
            title: post?.summary || "Post Details",
            text: post?.summary || "",
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare?.(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link ကို Copy ကူးလိုက်ပါပြီ။");
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link ကို Copy ကူးလိုက်ပါပြီ။");
            }
        }
    };

    const cleanMarkdown = (text: string) => {
        if (!text) return "";
        return text
            .replace(/\\n/g, '\n') 
            .replace(/\u00a0/g, ' ');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 min-h-screen">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="h-4 w-24 bg-gray-100 animate-pulse rounded-full" />
                    <div className="h-12 w-full bg-gray-100 animate-pulse rounded-xl" />
                    <div className="aspect-video w-full bg-gray-100 animate-pulse rounded-[2rem]" />
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                        <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                        <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-full hover:bg-gray-100"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full h-10 w-10 active:scale-95 transition-all shadow-sm"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 active:scale-95 transition-all shadow-sm">
                        <Bookmark className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Post Info */}
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm shadow-blue-200">
                    {post.categories?.name || "General"}
                </span>
                <div className="flex items-center text-gray-400 text-[12px] font-medium">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {post.created_at ? format(new Date(post.created_at), "MMMM dd, yyyy") : ""}
                </div>
            </div>

            {/* Summary Title */}
            <h1 className="text-3xl md:text-5xl font-black leading-[1.2] mb-8 text-slate-900 tracking-tight">
                {post.summary}
            </h1>

            {/* Featured Image */}
            {post.image_url && (
                <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl shadow-blue-50/50">
                    <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Article Content (Markdown) */}
            <article className="prose prose-lg prose-slate max-w-none 
                prose-headings:text-slate-900 prose-headings:font-black
                prose-p:text-slate-700 prose-p:leading-[1.8]
                prose-strong:text-slate-900 prose-strong:font-extrabold
                prose-img:rounded-3xl prose-a:text-blue-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanMarkdown(post.description)}
                </ReactMarkdown>
            </article>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t border-gray-100">
                <div className="bg-slate-50 rounded-[3rem] p-10 text-center border border-slate-100">
                    <h3 className="font-black text-xl mb-3 text-slate-900">ဖတ်ရှုပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်</h3>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        အခြားစိတ်ဝင်စားဖွယ်ရာများကို Home မှာ ဆက်လက်ဖတ်ရှုပါ။
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        className="bg-black hover:bg-slate-800 text-white rounded-full px-10 h-14 text-sm font-bold transition-all shadow-xl shadow-gray-200"
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}