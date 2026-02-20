import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  
  // Local State: Page Refresh မဖြစ်စေဖို့ သုံးပါတယ်
  const [isMuted, setIsMuted] = useState(false);

  // Auth ကနေ profile data ရလာတာနဲ့ state ကို update လုပ်မယ်
  useEffect(() => {
    if (profile) {
      setIsMuted(!!profile.send_emails);
    }
  }, [profile]);

  const handleToggle = async (checked: boolean) => {
    if (!profile) return;

    // ၁။ UI ကို အရင် Update လုပ်မယ် (Refresh မဖြစ်စေချင်လို့)
    setIsMuted(checked);

    try {
      // ၂။ Supabase မှာ သွားပြင်မယ်
      const { error } = await supabase
        .from('profiles')
        .update({ send_emails: checked })
        .eq('id', profile.id);

      if (error) throw error;

      // ၃။ Alert ပြတဲ့ Logic (False ဆိုမှ Alert ပြမယ်)
      if (checked === false) {
        toast.info("သင့်ထံသို့ Email များ ပေးပို့ပါတော့မည်", {
          description: "ပို့စ်အသစ်တင်တိုင်း အကြောင်းကြားစာ ရောက်လာပါလိမ့်မည်။",
        });
      } else {
        toast.success("Email ပို့ခြင်းကို ရပ်တန့်လိုက်ပါပြီ");
      }
      
      // window.location.reload(); <-- ဒါကို ဖြုတ်လိုက်ပြီဖြစ်လို့ Refresh မဖြစ်တော့ပါဘူး
    } catch (error: any) {
      // Error ဖြစ်ရင် UI ကို အဟောင်းအတိုင်း ပြန်ပြောင်းမယ်
      setIsMuted(!checked);
      toast.error("Update လုပ်လို့မရပါ: " + error.message);
    }
  };

  if (loading) return (
    <div className="p-10 text-center font-bold text-gray-400 animate-pulse tracking-widest">
      LOADING PROFILE...
    </div>
  );

  return (
    <div className="p-10 flex justify-center">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-6">
          <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Notifications</CardTitle>
          <p className="text-sm font-bold text-slate-400">{profile?.email}</p>
        </CardHeader>
        
        <CardContent className="space-y-6 py-8">
          <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-all">
            <div className="space-y-1">
              <Label className="text-base font-extrabold text-slate-800 cursor-pointer">
                Mute Notifications
              </Label>
              <p className="text-[12px] text-slate-500 font-medium">
                {isMuted 
                  ? "Blog အသစ်တင်တိုင်း Email ပို့ခြင်းကို ပိတ်ထားသည်" 
                  : "Blog အသစ်တင်တိုင်း Email ပို့ခြင်းကို ဖွင့်ထားသည်"}
              </p>
            </div>

            <Switch 
              checked={isMuted}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500 transition-all duration-300 scale-110"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}