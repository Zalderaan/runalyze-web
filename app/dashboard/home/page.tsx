'use client';

import { RunAnalysis } from "@/components/home/RunAnalysis";
import { NoAnalysis } from "@/components/home/NoAnalysis";
import { useHistory } from "@/hooks/use-history";
import { useBadges } from "@/hooks/use-badges";
import { BADGES, getAchievementsForRun } from "@/lib/badges.config";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { SquarePlus, TrendingUp, Clock, Target, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChartAreaDefault } from "@/components/home/chart-area-default"
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/RoleGuard";

export default function HomePage() {

    const { history, isLoading, error, fetchHistory, getLatestAnalysis } = useHistory();
    const latestAnalysis = getLatestAnalysis();
    const router = useRouter();

    // console.log('latest analysis: ', latestAnalysis)

    // fetch history when component mounts
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current && history.length === 0 && !isLoading) {
            fetchHistory();
            hasFetchedRef.current = true;
        }
    }, [fetchHistory, history.length, isLoading]);

    // Badges logic
    const { earnedBadges, fetchBadges, evaluateAndAwardBadges, isLoadingBadges } = useBadges();
    const hasFetchedBadgesRef = useRef(false);
    useEffect(() => {
        if (!hasFetchedBadgesRef.current) {
            fetchBadges();
            hasFetchedBadgesRef.current = true;
        }
    }, [fetchBadges]);

    const hasEvaluatedRef = useRef(false);
    useEffect(() => {
        if (history.length > 0 && !hasEvaluatedRef.current) {
            evaluateAndAwardBadges(history);
            hasEvaluatedRef.current = true;
        }
    }, [history, evaluateAndAwardBadges]);

    // Calculate quick stats
    const totalAnalyses = history.length;
    const avgScore = history.length > 0 ?
        Math.round(history.reduce((sum, item) => sum + item.overall_score, 0) / history.length) : 0;
    const recentAnalyses = history.slice(0, 3);

    // Calculate average joint angle scores
    const jointAverages = history.length > 0 ? {
        head_position: Math.round(history.reduce((sum, item) => sum + item.head_position, 0) / history.length),
        back_position: Math.round(history.reduce((sum, item) => sum + item.back_position, 0) / history.length),
        arm_flexion: Math.round(history.reduce((sum, item) => sum + item.arm_flexion, 0) / history.length),
        right_knee: Math.round(history.reduce((sum, item) => sum + item.right_knee, 0) / history.length),
        left_knee: Math.round(history.reduce((sum, item) => sum + item.left_knee, 0) / history.length),
        foot_strike: Math.round(history.reduce((sum, item) => sum + item.foot_strike, 0) / history.length),
    } : null;

    return (
        <RoleGuard allowedRoles={["user"]}>
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

                {/* Achievements Row */}
                {latestAnalysis && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Achievements Left Behind</h2>
                        {(() => {
                            const latestBadges = getAchievementsForRun(latestAnalysis.id, history);
                            if (latestBadges.length === 0) {
                                return (
                                    <div className="p-4 rounded-xl border bg-gray-50 border-gray-100 text-gray-500 text-sm">
                                        No specific achievements unlocked on your last run. Keep pushing to hit the next milestone!
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {latestBadges.map((badgeDef) => {
                                        const Icon = badgeDef.icon;
                                        return (
                                            <div 
                                                key={badgeDef.id} 
                                                className="p-4 rounded-xl border flex items-center gap-4 transition-all bg-white border-blue-200 shadow-sm ring-1 ring-blue-100 hover:scale-105"
                                            >
                                                <div className="p-3 rounded-full shrink-0 bg-blue-50">
                                                    <Icon className={`h-6 w-6 ${badgeDef.color}`} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">{badgeDef.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5" title={badgeDef.description}>{badgeDef.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}

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
                                    thumbnail_url: latestAnalysis.videos[0].thumbnail_url ?? "" 
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
                                                    <p className="font-medium text-gray-900 truncate max-w-[150px]">
                                                        {analysis.name || `Analysis #${analysis.id}`}
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

                        {jointAverages && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Joint Scores</h3>
                                <div className="space-y-3">
                                    {Object.entries(jointAverages).map(([joint, score]) => (
                                        <div key={joint} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {joint.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`font-semibold ${score >= 80 ? 'text-green-600' :
                                                score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {score}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Sample Analysis */}

                    </div>
                </div>
            </div>
        </RoleGuard>

    );
}