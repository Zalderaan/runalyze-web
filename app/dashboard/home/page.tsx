'use client';

import { RunAnalysis } from "@/components/home/RunAnalysis";
import { NoAnalysis } from "@/components/home/NoAnalysis";
import { useHistory } from "@/hooks/use-history";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { SquarePlus, TrendingUp, Clock, Target, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChartAreaDefault } from "@/components/home/chart-area-default"
import { RecommendedDrill } from "@/components/home/recommended-drill";
import { SmartTip } from "@/components/home/smart-tip";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {

    const { history, isLoading, error, fetchHistory, getLatestAnalysis } = useHistory();
    const latestAnalysis = getLatestAnalysis();
    const router = useRouter();

    console.log('latest analysis: ', latestAnalysis)

    // fetch history when component mounts
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current && history.length === 0 && !isLoading) {
            fetchHistory();
            hasFetchedRef.current = true;
        }
    }, [fetchHistory, history.length, isLoading]);

    // Calculate quick stats
    const totalAnalyses = history.length;
    const avgScore = history.length > 0 ?
        Math.round(history.reduce((sum, item) => sum + item.overall_score, 0) / history.length) : 0;
    const recentAnalyses = history.slice(0, 3);

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track your running form and improvement over time</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/analyze')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                    <SquarePlus className="h-5 w-5" />
                    New Analysis
                </Button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Analyses</p>
                            <p className="text-2xl font-bold text-gray-900">{totalAnalyses}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Best Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {history.length > 0 ? Math.max(...history.map(h => h.overall_score)).toFixed(2) : '0.00'}%
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Last Analysis</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {latestAnalysis ?
                                    new Date(latestAnalysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'None'
                                }
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Latest Analysis & Chart Section */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Latest Analysis */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Analysis</h2>
                        {isLoading ? (
                            <Card className="p-8">
                                <CardContent className="flex items-center justify-center">
                                    <div className="animate-pulse text-gray-500">Loading latest analysis...</div>
                                </CardContent>
                            </Card>
                        ) : error ? (
                            <Card className="p-8 border-red-200 bg-red-50">
                                <CardContent className="flex items-center justify-center">
                                    <p className="text-red-600">Error loading latest analysis.</p>
                                </CardContent>
                            </Card>
                        ) : latestAnalysis != null ? (
                            <RunAnalysis analysis={{
                                ...latestAnalysis,
                                thumbnail_url: Array.isArray(latestAnalysis.videos)
                                    ? latestAnalysis.videos[0]?.thumbnail_url ?? ""
                                    : latestAnalysis.videos?.thumbnail_url ?? "",
                            }} />
                        ) : (
                            <NoAnalysis />
                        )}
                    </div>

                    {/* Progress Chart */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Overview</h2>
                        <ChartAreaDefault history={history} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Smart Tip */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Smart Tip</h2>
                        <SmartTip />
                    </div>

                    {/* Recent Analyses */}
                    {recentAnalyses.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/dashboard/history')}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    View All
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {recentAnalyses.map((analysis) => (
                                    <Card
                                        key={analysis.id}
                                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.push(`/dashboard/history/${analysis.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Analysis #{analysis.id}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(analysis.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${analysis.overall_score >= 80 ? 'text-green-600' :
                                                        analysis.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {analysis.overall_score.toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommended Drills Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Drills</h2>
                <RecommendedDrill />
            </div>
        </div>
    );
}