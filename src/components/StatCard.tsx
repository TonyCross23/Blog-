import { Card, CardContent } from "./ui/card";

export function StatCard({ title, value, icon, color }: any) {
    return (
        <Card className="border-none bg-white dark:bg-[#0f172a] shadow-sm">
            <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                    <p className={`text-[10px] font-black text-${color}-500 uppercase tracking-widest`}>{title}</p>
                    <p className="text-4xl font-black">{value ?? 0}</p>
                </div>
                <div className={`p-4 bg-${color}-500/10 rounded-full text-${color}-500`}>{icon}</div>
            </CardContent>
        </Card>
    );
}