import { useGetPerformance } from "@/hooks/stats/use-performance";
import { secondsToMMSS } from "@/lib/stats/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";

export function PerformanceChart() {
  const { data: snapshots, isLoading } = useGetPerformance(false);

  if (isLoading) {
    return (
      <Card className="border-slate-100">
        <CardContent className="h-[350px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  // Transform data (oldest to newest)
  const chartData = [...(snapshots || [])]
    .reverse()
    .map((s) => ({
      date: new Date(s.recorded_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      "3K": s.time_3k_secs || null,
      "5K": s.time_5k_secs || null,
      "10K": s.time_10k_secs || null,
    }));

  const hasData = chartData.some((d) => d["3K"] !== null || d["5K"] !== null || d["10K"] !== null);

  if (!hasData) {
    return (
      <Card className="border-slate-100">
        <CardContent className="h-[350px] flex flex-col items-center justify-center text-slate-400">
          <Activity className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium">Not enough performance data to render chart</p>
          <p className="text-xs text-slate-400 mt-1">Please log at least one run duration record.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-800">Running Trends</CardTitle>
        <CardDescription>Run durations per distance over time (lower is faster)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => secondsToMMSS(v)}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
                labelClassName="text-slate-500 font-medium text-xs mb-1"
                formatter={(value: any) => [secondsToMMSS(Number(value)), "Time"]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="3K"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ stroke: "#f59e0b", strokeWidth: 1, r: 3, fill: "#ffffff" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="5K"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ stroke: "#6366f1", strokeWidth: 1, r: 3, fill: "#ffffff" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="10K"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ stroke: "#f43f5e", strokeWidth: 1, r: 3, fill: "#ffffff" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
