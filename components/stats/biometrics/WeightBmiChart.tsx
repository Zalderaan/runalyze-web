import { useGetBiometrics } from "@/hooks/stats/use-biometrics";
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

export function WeightBmiChart() {
  const { data: snapshots, isLoading } = useGetBiometrics(false); // only active entries for chart

  if (isLoading) {
    return (
      <Card className="border-slate-100">
        <CardContent className="h-[350px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts (chronological order)
  const chartData = [...(snapshots || [])]
    .filter((s) => s.weight_kg !== null || s.bmi !== null)
    .reverse() // from oldest to newest
    .map((s) => ({
      date: new Date(s.recorded_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      weight: s.weight_kg,
      bmi: s.bmi ? Number(s.bmi) : null,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="border-slate-100">
        <CardContent className="h-[350px] flex flex-col items-center justify-center text-slate-400">
          <Activity className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium">Not enough data to render trend chart</p>
          <p className="text-xs text-slate-400 mt-1">Please log at least one entry containing weight.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-800">Biometrics Progress</CardTitle>
        <CardDescription>Weight and BMI trends over logged check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#6366f1"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                unit="kg"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                unit=""
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
                labelClassName="text-slate-500 font-medium text-xs mb-1"
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-semibold text-slate-600 capitalize">{value}</span>}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="weight"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ stroke: "#6366f1", strokeWidth: 1, r: 3, fill: "#ffffff" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bmi"
                name="BMI"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ stroke: "#10b981", strokeWidth: 1, r: 3, fill: "#ffffff" }}
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
