import * as z from "zod";

export const editPostSchema = z.object({
    title: z.string().min(5, "ခေါင်းစဉ် အနည်းဆုံး ၅ လုံးရှိရမည်"),
    summary: z.string().min(10, "အကျဉ်းချုပ် အနည်းဆုံး ၁၀ လုံးရှိရမည်"),
    description: z.string().min(20, "Content အနည်းဆုံး ၂၀ လုံးရှိရမည်"),
});

export type EditPostFormValues = z.infer<typeof editPostSchema>;