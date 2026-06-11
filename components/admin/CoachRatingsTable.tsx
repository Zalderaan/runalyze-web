'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmins } from "@/hooks/users/use-admins";
import { Loader2, AlertCircle, Star, Award, Trophy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CoachRatingsTable() {
    const { admins, usersLoading, usersError } = useAdmins();

    // Filter out only active coaches for ranking, or display all.
    // The RPC already returns only users with role 'admin' (which is the coach role in consultations).
    // Let's display all coaches, sorting them by average rating descending, then rating count.
    const rankedCoaches = [...admins].sort((a, b) => {
        const ratingA = a.avg_rating !== null ? Number(a.avg_rating) : -1;
        const ratingB = b.avg_rating !== null ? Number(b.avg_rating) : -1;
        if (ratingB !== ratingA) {
            return ratingB - ratingA;
        }
        return (b.rating_count || 0) - (a.rating_count || 0);
    });

    const getRankBadge = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/50 px-2 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Trophy className="h-3 w-3 text-amber-500 fill-amber-500" /> #1
                    </span>
                );
            case 1:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900/50 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800">
                        <Award className="h-3 w-3 text-slate-400 fill-slate-400" /> #2
                    </span>
                );
            case 2:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/10 dark:bg-amber-900/25 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-600/20 dark:border-amber-800/50">
                        <Award className="h-3 w-3 text-amber-600 fill-amber-600" /> #3
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                        #{index + 1}
                    </span>
                );
        }
    };

    const renderRating = (avg: number | null, count: number) => {
        if (avg === null || count === 0) {
            return <span className="text-xs text-zinc-400 dark:text-zinc-500 italic font-medium">No ratings yet</span>;
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{Number(avg).toFixed(1)}</span>
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">({count} {count === 1 ? 'rating' : 'ratings'})</span>
            </div>
        );
    };

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };

    if (usersLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Fetching rankings...</p>
                </div>
            </div>
        );
    }

    if (usersError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to fetch coach rankings. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (rankedCoaches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Award className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">No coaches found</h3>
                <p className="text-sm text-zinc-500 mt-1">There are no coaches active on the platform at this moment.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[12%]">Rank</TableHead>
                            <TableHead className="w-[38%]">Coach</TableHead>
                            <TableHead className="w-[30%]">Rating</TableHead>
                            <TableHead className="w-[20%] text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankedCoaches.map((coach, index) => (
                            <TableRow key={coach.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <TableCell className="font-medium align-middle">
                                    {getRankBadge(index)}
                                </TableCell>
                                <TableCell className="align-middle">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 bg-primary/10 text-primary border border-primary/20">
                                            <AvatarFallback className="text-xs font-bold bg-zinc-100 dark:bg-zinc-850">
                                                {getInitials(coach.username || 'CH')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{coach.username}</span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{coach.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="align-middle">
                                    {renderRating(coach.avg_rating, coach.rating_count)}
                                </TableCell>
                                <TableCell className="text-right align-middle">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            coach.is_active
                                                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                                                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                                        }`}
                                    >
                                        {coach.is_active ? "Active" : "Disabled"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {rankedCoaches.map((coach, index) => (
                    <div
                        key={coach.id}
                        className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0">
                                {getRankBadge(index)}
                            </div>
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar className="h-8 w-8 bg-primary/10 text-primary border border-primary/20">
                                    <AvatarFallback className="text-xs font-bold bg-zinc-100 dark:bg-zinc-850">
                                        {getInitials(coach.username || 'CH')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{coach.username}</span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{coach.email}</span>
                                    <div className="mt-1">
                                        {renderRating(coach.avg_rating, coach.rating_count)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    coach.is_active
                                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                                        : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                                }`}
                            >
                                {coach.is_active ? "Active" : "Disabled"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
