import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { ChevronLeft, Clock, Share2, Bookmark } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { usePostDetails } from "../hooks/usePostDetails"; // Hook ကို Import လုပ်ပါ

export default function PostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: post, isLoading, isError } = usePostDetails(id);

    if (isError) {
        toast.error("Post ရှာမတွေ့ပါ သို့မဟုတ် Error ဖြစ်နေပါသည်");
        navigate("/");
        return null;
    }

    const handleShare = async () => {
        if (!post) return;
        const shareData = {
            title: post.summary || "Post Details",
            text: post.summary || "",
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
        return text.replace(/\\n/g, '\n').replace(/\u00a0/g, ' ');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors">
                <div className="container mx-auto px-6 py-20 max-w-3xl space-y-8">
                    <div className="h-4 w-24 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-none" />
                    <div className="h-16 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-none" />
                    <div className="aspect-video w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-none" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                
                {/* Action Bar */}
                <div className="flex items-center justify-between mb-16">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="rounded-none hover:bg-slate-100 dark:hover:bg-slate-900 font-black uppercase text-[10px] tracking-[0.2em] dark:text-slate-400"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex gap-4">
                        <Button variant="outline" size="icon" className="rounded-none border-slate-200 dark:border-slate-800 dark:bg-transparent dark:text-white hover:scale-110 transition-transform" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-none border-slate-200 dark:border-slate-800 dark:bg-transparent dark:text-white hover:scale-110 transition-transform">
                            <Bookmark className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Post Metadata */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] px-4 py-1.5 font-black uppercase tracking-[0.2em]">
                        {post?.categories?.name || "General"}
                    </span>
                    <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        {post?.created_at ? format(new Date(post.created_at), "MMM dd, yyyy") : ""}
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-12 text-slate-900 dark:text-white tracking-tighter">
                    {post?.summary}
                </h1>

                {/* Featured Image */}
                {post?.image_url && (
                    <div className="relative aspect-video w-full overflow-hidden mb-16 border dark:border-slate-800 shadow-2xl">
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Article Content */}
                <article className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                    prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter
                    prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-[1.8] prose-p:text-lg
                    prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-black
                    prose-img:rounded-none prose-img:border dark:prose-img:border-slate-800
                    prose-blockquote:border-l-4 prose-blockquote:border-black dark:prose-blockquote:border-white prose-blockquote:italic">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cleanMarkdown(post?.description)}
                    </ReactMarkdown>
                </article>

                {/* Footer */}
                <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-[#0f172a] p-12 text-center border dark:border-slate-800">
                        <h3 className="font-black text-2xl mb-4 text-slate-900 dark:text-white uppercase tracking-tighter">Thanks for reading</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 leading-relaxed max-w-md mx-auto font-medium">
                            Explore more insights and stories back on our home feed.
                        </p>
                        <Button
                            onClick={() => navigate("/")}
                            className="bg-black text-white dark:bg-white dark:text-black hover:scale-[1.05] transition-transform rounded-none px-12 h-14 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}