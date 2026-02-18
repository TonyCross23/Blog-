import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { PlusCircle } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

export default function AdminPostPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [catLoading, setCatLoading] = useState(false);

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) toast.error("Categories ဆွဲလို့မရပါ");
        else setCategories(data || []);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- Category အသစ်တိုးတဲ့ Logic ---
    const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCatLoading(true);

        const formData = new FormData(e.currentTarget);
        const catName = formData.get("category_name") as string;

        const { error } = await supabase.from('categories').insert([{ name: catName }]);

        if (error) {
            toast.error("Category တိုးလို့မရပါ: " + error.message);
        } else {
            toast.success("Category အသစ် ထည့်ပြီးပါပြီ!");
            (e.target as HTMLFormElement).reset();
            fetchCategories(); // List ကို Update လုပ်မယ်
        }
        setCatLoading(false);
    };

    // --- Post အသစ်တင်တဲ့ Logic ---
    const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const postData = {
            title: formData.get("title") as string,
            summary: formData.get("summary") as string,
            description: formData.get("description") as string,
            category_id: formData.get("category_id") as string,
        };

        const { error } = await supabase.from('posts').insert([postData]);

        if (error) {
            toast.error("Error: " + error.message);
        } else {
            toast.success("Post တင်ပြီးပါပြီ!");
            (e.target as HTMLFormElement).reset();
        }
        setLoading(false);
    };

    return (
        <div className="p-10 flex flex-col items-center space-y-8">

            {/* 1. Category Create Card */}
            <Card className="w-full max-w-2xl border-dashed border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <PlusCircle className="w-5 h-5" />
                        Add New Category
                    </CardTitle>
                    <CardDescription>Post မတင်ခင် အမျိုးအစား အသစ်ရှိရင် အရင်တိုးပါ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCategorySubmit} className="flex gap-4">
                        <Input
                            name="category_name"
                            placeholder="ဥပမာ- နည်းပညာ၊ ဗဟုသုတ"
                            required
                            className="flex-1"
                        />
                        <Button type="submit" variant="secondary" disabled={catLoading}>
                            {catLoading ? "Adding..." : "Add Category"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* 2. Post Create Card */}
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="ပို့စ်ခေါင်းစဉ်" required />
                        </div>

                        <div>
                            <Label>Category</Label>
                            <Select name="category_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="အမျိုးအစား ရွေးချယ်ပါ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="summary">Summary</Label>
                            <Input id="summary" name="summary" placeholder="ပို့စ်အကျဉ်းချုပ်" required />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="အသေးစိတ်ရေးသားရန်" rows={6} required />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "တင်နေပါသည်..." : "Publish Post"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}