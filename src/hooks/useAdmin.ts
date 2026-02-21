import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

//Dashboard Stats (Posts & Users Count)
export const useAdminStats = () => {
    return useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const { count: postCount } = await supabase.from("posts").select("*", { count: 'exact', head: true });
            const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
            return { postCount: postCount || 0, userCount: userCount || 0 };
        }
    });
};

//Paginated Posts
export const useAdminPosts = (page: number, itemsPerPage: number) => {
    return useQuery({
        queryKey: ["posts", page],
        queryFn: async () => {
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            const { data, count, error } = await supabase
                .from("posts")
                .select("id, title, summary, description, created_at, categories(name)", { count: 'exact' })
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { posts: data, totalCount: count || 0 };
        }
    });
};

//Post Update 
export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
            const { error } = await supabase.from("posts").update(updates).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });
};

//Post Delete
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("posts").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        }
    });
};