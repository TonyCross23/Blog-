import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const usePostDetails = (id: string | undefined) => {
    return useQuery({
        queryKey: ["post", id],
        queryFn: async () => {
            if (!id) throw new Error("No Post ID provided");
            
            const { data, error } = await supabase
                .from("posts")
                .select("*, categories(name)")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};