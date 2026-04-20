'use client';

import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/user_context";
import { useGetTopDrills } from "@/hooks/drills/use-get-top-drills";
import { Dumbbell, Users, FileText, ThumbsUp, ArrowUpRight, Plus, Settings } from "lucide-react";
import { TopDrillsList } from "@/components/drills/TopDrillsList";
import Link from "next/link";
import { useGetDrillCount } from "@/hooks/drills/use-get-drill-count";
import { useApplicationsCount } from "@/hooks/admin-application/use-get-application-count";
import { useUsers } from "@/hooks/users/use-users";
import { RecentApplications } from "@/components/admin/RecentApplications";
import { useApplications } from "@/hooks/users/use-applications";
import { Button } from "@/components/ui/button";
import { PlatformInsights } from "@/components/admin/PlatformInsights";
import { useDrills } from "@/hooks/drills/use-drills";

export default function AdminPage() {
    const { user } = useAuth();
    const isOwner = user?.user_role === "owner";
    
    const { count, isLoading, error, refetch } = useGetDrillCount();
    const { users, usersLoading, usersError, refreshUsers } = useUsers();
    const { drills, loading: drillsLoading } = useDrills(1, 50); // Get a larger sample for insights

    const { applications, applicationsLoading, applicationsError, refreshApplications } = useApplications();

    const recentApplications = applications
        .filter(app => app.submittedAt && app.applicationId !== null)
        .map(app => ({ ...app, applicationId: app.applicationId! }))
        .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
        .slice(0, 5);

    const { topDrills, isLoading: isTopDrillsLoading, error: topDrillsError, refetch: topDrillsRefetch } = useGetTopDrills();
    const topDrill = topDrills?.[0];
    const topDrillScore = topDrill
        ? (topDrill.helpful_count - topDrill.not_helpful_count)
        : 0;
    const topDrillDescription = topDrill
        ? `${topDrill.drill_name} • ${topDrill.area}`
        : "No drills yet";

    const { counts, isLoading: isApplicationsCountLoading, error: applicationsCountError, refetch: applicationsCountRefetch } = useApplicationsCount();

    const handleRefreshStats = () => {
        refetch();
        refreshUsers();
        refreshApplications();
        topDrillsRefetch();
        applicationsCountRefetch();
    }

    return (
        <RoleGuard allowedRoles={["admin", "owner"]}>
            <main className={`flex flex-col space-y-8 pb-10 ${isOwner ? 'theme-owner' : ''}`}>
                {/* Immersive Header */}
                <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-2xl dark:from-zinc-950 dark:to-zinc-900">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-primary/80 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-semibold tracking-wider uppercase">
                                {isOwner ? 'Owner Dashboard' : 'Administrator Overview'}
                            </span>
                        </div>
                        <h1 className="font-bold text-4xl tracking-tight mb-2">
                            Welcome back, <span className="text-primary">{user?.username}</span>
                        </h1>
                        <p className="text-zinc-400 max-w-md">
                            Monitor platform health, manage drill libraries, and review expert coach applications.
                        </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Active Drills"
                        value={isLoading ? "..." : count.toString()}
                        icon={<Dumbbell className="h-5 w-5" />}
                        trend="+12%"
                        trendUp={true}
                        description={error ? "Error loading" : "Library size"}
                    />
                    <StatsCard
                        title="Total Users"
                        value={usersLoading ? "..." : users.length.toString()}
                        icon={<Users className="h-5 w-5" />}
                        trend="+3%"
                        trendUp={true}
                        description={usersError ? "Error loading" : "Global reach"}
                    />
                    <StatsCard
                        title="Applications"
                        value={isApplicationsCountLoading ? "..." : counts.pending.toString()}
                        icon={<FileText className="h-5 w-5" />}
                        trend="Pending"
                        trendUp={counts.pending > 0}
                        description={applicationsCountError ? "Error loading" : "Action required"}
                    />
                    <StatsCard
                        title="Engagement"
                        value={isTopDrillsLoading ? "..." : topDrillScore.toString()}
                        icon={<ThumbsUp className="h-5 w-5" />}
                        trend={topDrillDescription}
                        trendUp={true}
                        description="Top Drill Rating"
                    />
                </div>

                {/* Platform Insights (Charts) */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-semibold">Platform Insights</h2>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={handleRefreshStats}>
                            Update Visuals
                        </Button>
                    </div>
                    <PlatformInsights 
                        drills={drills} 
                        applicationCounts={counts} 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Applications Feed */}
                    <Card className="lg:col-span-2 glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Recent Activity</CardTitle>
                                <CardDescription>Latest coach onboarding applications</CardDescription>
                            </div>
                            <Link href="/dashboard/admin/consultations" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                View History <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <RecentApplications applications={recentApplications} />
                        </CardContent>
                    </Card>

                    {/* Quick Access Actions */}
                    <div className="flex flex-col gap-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-xl">Quick Actions</CardTitle>
                                <CardDescription>Common management tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <Link
                                    href="/dashboard/admin/drills"
                                    className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Dumbbell className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Drill Library</span>
                                    </div>
                                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                
                                <Link
                                    href="/dashboard/admin/consultations"
                                    className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Applications</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>

                                {isOwner && (
                                    <Link 
                                        href="/dashboard/admin/manage" 
                                        className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium">Access Control</span>
                                        </div>
                                        <Settings className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Drills Showcase */}
                        <Card className="glass-card flex-grow shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Top Performers</CardTitle>
                                    <CardDescription>Most helpful drills</CardDescription>
                                </div>
                                <Link
                                    href="/dashboard/admin/drills"
                                    className="text-primary hover:underline h-8 w-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
                                >
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <TopDrillsList topDrills={topDrills?.slice(0, 3)} isLoading={isTopDrillsLoading} error={topDrillsError} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </RoleGuard>
    );
}

function StatsCard({ title, value, icon, description, trend, trendUp }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
    trend?: string;
    trendUp?: boolean;
}) {
    return (
        <Card className="glass-card border-none shadow-lg">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
                        <div className="flex items-center gap-1.5 mt-2">
                            {trend && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>
                                    {trend}
                                </span>
                            )}
                            <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[100px]">{description}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// function TopDrillsList() {
//     // TODO: Fetch top 5 drills ordered by helpful_count
//     return (
//         <div className="text-sm text-gray-500">
//             Loading top drills...
//         </div>
//     );
// }

// function RecentApplicationsList() {
//     // TODO: Fetch recent 5 applications
//     return (
//         <div className="text-sm text-gray-500">
//             Loading recent applications...
//         </div>
//     );
// }