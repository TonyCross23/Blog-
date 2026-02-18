import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  const handleToggle = async (checked: boolean) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ send_emails: checked })
      .eq('id', profile.id);

    if (error) {
      toast.error("Update လုပ်လို့မရပါ");
    } else {
      toast.success(checked ? "Email အသိပေးချက် ဖွင့်လိုက်ပါပြီ" : "Email အသိပေးချက် ပိတ်လိုက်ပါပြီ");
      // Note: AuthContext ထဲက profile state ကိုလည်း update ဖြစ်အောင် လုပ်ဖို့ လိုနိုင်ပါတယ်။
      // ဒါပေမယ့် context က refresh ဖြစ်ရင် database ကနေ ပြန်ဆွဲပါလိမ့်မယ်။
      window.location.reload(); // ရိုးရိုးရှင်းရှင်း refresh လုပ်လိုက်တာပါ
    }
  };

  if (loading) return <p className="p-10 text-center">Loading Profile...</p>;

  return (
    <div className="p-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-lg">Email Notifications</Label>
            <p className="text-sm text-gray-500">Post အသစ်တင်တိုင်း Email ပို့ပေးရန်</p>
          </div>
          <Switch 
            checked={profile?.send_emails} 
            onCheckedChange={handleToggle} 
          />
        </CardContent>
      </Card>
    </div>
  );
}