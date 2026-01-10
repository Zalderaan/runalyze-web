'use client';

import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/user_context";
import { useGetTopDrills } from "@/hooks/drills/use-get-top-drills";
import { Dumbbell, Users, FileText, ThumbsUp } from "lucide-react";
import { TopDrillsList } from "@/components/drills/TopDrillsList";
import Link from "next/link";
import { useGetDrillCount } from "@/hooks/drills/use-get-drill-count";
import { useApplicationsCount } from "@/hooks/admin-application/use-get-application-count";
import { useUsers } from "@/hooks/users/use-users";
import { RecentApplications } from "@/components/admin/RecentApplications";
import { useApplications } from "@/hooks/users/use-applications";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
    const { user } = useAuth();
    const { count, isLoading, error, refetch } = useGetDrillCount();
    const { users, usersLoading, usersError, refreshUsers } = useUsers();

    const { applications, applicationsLoading, applicationsError, refreshApplications } = useApplications();

    const recentApplications = applications
        .filter(app => app.submittedAt && app.applicationId !== null) // Exclude apps without submission date or null ID
        .map(app => ({ ...app, applicationId: app.applicationId! })) // Assert non-null for type compatibility
        .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
        .slice(0, 5);

    // console.log("recentApplications: ", recentApplications)

    const { topDrills, isLoading: isTopDrillsLoading, error: topDrillsError, refetch: topDrillsRefetch } = useGetTopDrills();
    const topDrill = topDrills?.[0];
    const topDrillScore = topDrill
        ? (topDrill.helpful_count - topDrill.not_helpful_count)
        : 0;
    const topDrillDescription = topDrill
        ? `${topDrill.drill_name} • ${topDrill.area} • ${topDrill.performance_level}`
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
            <main className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-3xl">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Overview of your platform</p>
                    </div>
                    {/* <Button
                        type="button"
                        onClick={handleRefreshStats}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Refresh data
                    </Button> */}
                </div>

                {/* Quick Stats */}
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Drills"
                        value={isLoading ? "..." : count.toString()}
                        icon={<Dumbbell className="h-5 w-5" />}
                        description={error ? "Error loading drills" : "Active drills"}
                    />
                    <StatsCard
                        title="Total Users"
                        value={usersLoading ? "..." : users.length.toString()}
                        icon={<Users className="h-5 w-5" />}
                        description={usersError ? "Error loading users" : "Registered users"}
                    />
                    <StatsCard
                        title="Pending Applications"
                        value={isApplicationsCountLoading ? "..." : counts.pending.toString()}
                        icon={<FileText className="h-5 w-5" />}
                        description={applicationsCountError ? "Error loading applications" : "Awaiting review"}
                    />
                    <StatsCard
                        title="Top Drill Score"
                        value={isTopDrillsLoading ? "..." : topDrillScore.toString()}
                        icon={<ThumbsUp className="h-5 w-5" />}
                        description={isTopDrillsLoading ? "Loading..." : topDrillDescription}
                    />
                </div>

                {/* Top Liked Drills */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Top Liked Drills</CardTitle>
                            <CardDescription>Most helpful drills by user votes</CardDescription>
                        </div>
                        <Link
                            href="/dashboard/admin/drills"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View all →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <TopDrillsList topDrills={topDrills} isLoading={isTopDrillsLoading} error={topDrillsError} />
                    </CardContent>
                </Card>

                {/* Recent Activity / Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>
                                {applicationsLoading
                                    ? "Loading latest admin applications..."
                                    : applicationsError
                                        ? "Error loading applications"
                                        : "Latest admin applications"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentApplications applications={recentApplications} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Link
                                href="/dashboard/admin/drills"
                                className="p-3 rounded-lg border hover:bg-gray-50 flex items-center gap-3"
                            >
                                <Dumbbell className="h-5 w-5 text-gray-600" />
                                <span>Manage Drills</span>
                            </Link>
                            {user?.user_role === "owner" && (
                                <Link href="/dashboard/admin/manage" className="p-3 rounded-lg border hover:bg-gray-50 flex items-center gap-3">
                                    <Users className="h-5 w-5 text-gray-600" />
                                    <span>Manage Admins</span>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </RoleGuard>
    );
}

function StatsCard({ title, value, icon, description }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-full">
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