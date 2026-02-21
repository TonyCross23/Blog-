import { z } from "zod";

export const categorySchema = z.object({
    name: z.string()
        .min(2, "အနည်းဆုံး စာလုံး ၂ လုံး ရှိရပါမည်")
        .max(20, "စာလုံး ၂၀ ထက် မကျော်ရပါ")
        .nonempty("Category နာမည် ထည့်ပေးရန် လိုအပ်ပါသည်"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;