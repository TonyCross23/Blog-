import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

// Categories hook
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data, error } = await supabase.from("categories").select("*").order("name");
            if (error) throw error;
            return data;
        },
    });
};

// Posts hook
export const usePosts = (page: number, category: string, searchQuery: string, itemsPerPage: number) => {
    return useQuery({
        queryKey: ["posts", { page, category, searchQuery }],
        queryFn: async () => {
            const from = page * itemsPerPage;
            const to = from + itemsPerPage - 1;

            let query = supabase
                .from("posts")
                .select("id, summary, created_at, image_url, category_id, categories(name)", { count: 'exact' });

            if (category !== "all") {
                query = query.eq("category_id", category);
            }

            if (searchQuery) {
                query = query.ilike("summary", `%${searchQuery}%`);
            }

            const { data, count, error } = await query
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { posts: data, totalCount: count || 0 };
        },
    });
};