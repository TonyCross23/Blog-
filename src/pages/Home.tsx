import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface Post {
  id: string;
  title: string;
  summary: string;
  description: string;
  created_at: string;
  categories: {
    name: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, 
        title, 
        summary, 
        description, 
        created_at,
        categories ( name )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Posts များဆွဲယူရာတွင် အမှားရှိနေပါသည်");
    } else {
      setPosts(data as any);
    }
    setLoading(false);
  };

  if (loading) return <p className="text-center p-10 text-muted-foreground">Loading posts...</p>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Latest Blog Posts</h1>
      
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">ပို့စ်များ မရှိသေးပါ။</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
                <Badge variant="secondary">
                  {post.categories?.name || "Uncategorized"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.summary}</p>
                <p className="text-sm line-clamp-3">{post.description}</p>
              </CardContent>
              <CardFooter className="text-xs text-gray-400">
                Published on: {new Date(post.created_at).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}