import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import emailjs from '@emailjs/browser';

interface CreatePostData {
    title: string;
    summary: string;
    description: string;
    categoryId: string;
    file: File | null;
}

export const useCreatePost = (onSuccessCallback: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, summary, description, categoryId, file }: CreatePostData) => {
            let uploadedImageUrl = "";

            //Image Upload 
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `posts/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
                uploadedImageUrl = urlData.publicUrl;
            }

            // Database Post Insert
            const { data: newPost, error } = await supabase.from("posts").insert([{
                title,
                summary,
                description,
                category_id: categoryId,
                image_url: uploadedImageUrl,
            }]).select().single();

            if (error) throw error;

            // Email Notifications 
            const { data: profiles } = await supabase
                .from('profiles')
                .select('email')
                .eq('send_emails', false);

            if (profiles && profiles.length > 0 && newPost) {
                const emailPromises = profiles.map((user) =>
                    emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        {
                            title: title,
                            post_url: `${window.location.origin}/post/${newPost.id}`,
                            to_email: user.email,
                        },
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                    )
                );
                await Promise.all(emailPromises);
            }

            return newPost;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            onSuccessCallback();
        },
    });
};