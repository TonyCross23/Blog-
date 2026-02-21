import { z } from "zod";

export const postSchema = z.object({
    title: z.string().min(5, "ခေါင်းစဉ် အနည်းဆုံး ၅ လုံးရှိရပါမည်").max(100),
    summary: z.string().min(10, "အကျဉ်းချုပ် အနည်းဆုံး ၁၀ လုံးရှိရပါမည်"),
    description: z.string().min(20, "Content အနည်းဆုံး အလုံး ၂၀ ရှိရပါမည်"),
    categoryId: z.string().min(1, "Category တစ်ခု ရွေးပေးပါ"),
});

export type PostFormValues = z.infer<typeof postSchema>;