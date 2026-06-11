import { useGetPersonalBests } from "@/hooks/stats/use-performance";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

export function PersonalBestDisplay() {
  const { data: pbs, isLoading } = useGetPersonalBests();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-100/80">
            <CardContent className="p-4 flex items-center justify-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pbCards = [
    {
      label: "3K Personal Best",
      time: pbs?.time_3k_formatted || "Not set",
      icon: Medal,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-100",
    },
    {
      label: "5K Personal Best",
      time: pbs?.time_5k_formatted || "Not set",
      icon: Trophy,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50/50",
      borderColor: "border-indigo-100",
    },
    {
      label: "10K Personal Best",
      time: pbs?.time_10k_formatted || "Not set",
      icon: Award,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50/50",
      borderColor: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {pbCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className={`border ${card.borderColor} shadow-sm overflow-hidden`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bgColor} ${card.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{card.time}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
