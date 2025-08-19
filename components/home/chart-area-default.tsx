"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A chart showing running analysis progress over time"

const chartConfig = {
  overall_score: {
    label: "Overall Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ChartAreaDefaultProps {
  history: Array<{
    id: number;
    created_at: string;
    overall_score: number;
  }>;
}

export function ChartAreaDefault({ history }: ChartAreaDefaultProps) {
  // Transform history data for the chart
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Sort by date and take last 10 analyses for better readability
    const sortedHistory = [...history]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-10);

    return sortedHistory.map((item, index) => ({
      analysis: `#${item.id}`,
      date: new Date(item.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      overall_score: Math.round(item.overall_score * 100) / 100, // Round to 2 decimal places
      analysis_number: index + 1,
    }));
  }, [history]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const firstScore = chartData[0].overall_score;
    const lastScore = chartData[chartData.length - 1].overall_score;
    const improvement = lastScore - firstScore;
    const percentChange = ((improvement / firstScore) * 100);
    
    return {
      improvement,
      percentChange: Math.abs(percentChange),
      isPositive: improvement >= 0
    };
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
        <CardDescription>
          Your running form scores over your recent analyses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No analysis data yet</p>
              <p className="text-sm">Complete your first analysis to see progress charts</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  indicator="dot" 
                  labelFormatter={(value, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? `Analysis ${data.analysis} - ${value}` : value;
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Score"
                  ]}
                />}
              />
              <Area
                dataKey="overall_score"
                type="monotone"
                fill="var(--color-overall_score)"
                fillOpacity={0.2}
                stroke="var(--color-overall_score)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      {chartData.length > 0 && trend && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                {trend.isPositive ? (
                  <>
                    <span className="text-green-600">
                      Improved by {trend.improvement.toFixed(1)} points
                    </span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </>
                ) : (
                  <>
                    <span className="text-red-600">
                      Decreased by {Math.abs(trend.improvement).toFixed(1)} points
                    </span>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                Based on your last {chartData.length} analyses
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
