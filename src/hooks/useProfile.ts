import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const useUpdateNotification = (profileId: string | undefined) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (isMuted: boolean) => {
            if (!profileId) throw new Error("User profile not found");

            const { data, error } = await supabase
                .from('profiles')
                .update({ send_emails: isMuted })
                .eq('id', profileId);

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};