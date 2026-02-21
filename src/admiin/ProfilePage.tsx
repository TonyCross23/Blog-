import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Bell, BellOff, User, Mail, Loader2 } from "lucide-react";
import { useUpdateNotification } from "../hooks/useProfile";

export default function ProfilePage() {
  const { profile, loading: authLoading } = useAuth();
  const [isMuted, setIsMuted] = useState(false);

  // Mutation Hook
  const { mutate, isPending } = useUpdateNotification(profile?.id);

  useEffect(() => {
    if (profile) {
      setIsMuted(!!profile.send_emails);
    }
  }, [profile]);

  const handleToggle = (checked: boolean) => {
    // Optimistic Update: UI 
    setIsMuted(checked);

    mutate(checked, {
      onSuccess: () => {
        if (checked === false) {
          toast.info("Notifications Enabled", {
            description: "You will receive emails when new posts are published.",
          });
        } else {
          toast.success("Notifications Muted");
        }
      },
      onError: (error: any) => {
        setIsMuted(!checked);
        toast.error("Update failed: " + error.message);
      }
    });
  };

  if (authLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 animate-pulse uppercase">
        Retrieving Profile...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300 py-12 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Page Heading */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Profile Settings</h1>
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Manage your account preferences</p>
        </div>

        {/* User Info Card */}
        <Card className="rounded-none border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden border-t-4 border-t-black dark:border-t-white">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border dark:border-slate-700 shadow-inner">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Email</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase ml-1">Privacy & Alerts</h2>
          
          <Card className="rounded-none border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-xl relative overflow-hidden">
            {/* Loading Overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
            
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex gap-5 items-start">
                  <div className={`p-3 rounded-none border ${isMuted ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-900/50 text-red-500' : 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-900/50 text-green-500'}`}>
                    {isMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white cursor-pointer">
                      Mute Email Notifications
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[280px]">
                      {isMuted 
                        ? "Currently silent. You won't receive any email alerts for new blog updates." 
                        : "Currently active. We'll notify you whenever a new story is published."}
                    </p>
                  </div>
                </div>

                <Switch 
                  checked={isMuted}
                  onCheckedChange={handleToggle}
                  disabled={isPending}
                  className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-800 scale-125 transition-all"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
          <Mail className="w-5 h-5 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
            Your preferences are saved automatically and synced across all your active devices.
          </p>
        </div>

      </div>
    </div>
  );
}