'use client';

import { useHistory } from "@/hooks/use-history";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    History,
    Search,
    Calendar,
    TrendingUp,
    Clock,
    PlayCircle,
    FileX,
    Loader2,
    AlertCircle,
    Target,
    Activity,
    ArrowUpRight,
    GitCompare,
    X,
    Check
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getScoreColor } from "@/components/home/RunAnalysis";
import { RoleGuard } from "@/components/RoleGuard";
import { cn } from "@/lib/utils";
import { HistoryItem } from "@/hooks/use-history";

// ...existing HistoryItemProps interface...

interface HistoryCardProps {
    analysis: HistoryItem
    compareMode?: boolean;
    isSelected?: boolean;
    selectionOrder?: number;
    onSelect?: (id: number) => void;
}

function HistoryCard({ analysis, compareMode, isSelected, selectionOrder, onSelect }: HistoryCardProps) {
    const createdAt = new Date(analysis.created_at);
    const formattedDate = createdAt.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const thumbnailUrl = analysis.videos?.[0].thumbnail_url ?? ""

    // Debug: Check what's coming through
    console.log(`Analysis ${analysis.id}:`, {
        videos: analysis.videos,
        thumbnailUrl: thumbnailUrl,
        hasUrl: !!thumbnailUrl
    });

    const handleClick = () => {
        if (compareMode && onSelect) {
            onSelect(analysis.id);
        }
    };

    return (
        <Card
            className={cn(
                "group hover:shadow-lg transition-all duration-200",
                compareMode && "cursor-pointer",
                isSelected && "ring-2 ring-blue-500 bg-blue-50",
                !isSelected && compareMode && "hover:border-blue-200"
            )}
            onClick={handleClick}
        >
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
                {thumbnailUrl ? (
                    <Image
                        src={thumbnailUrl}
                        alt="Running analysis thumbnail"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-gray-400" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        <Activity className="h-3 w-3 mr-1" />
                        Analysis #{analysis.id}
                    </Badge>
                </div>

                {/* Selection indicator for compare mode */}
                {compareMode && isSelected && (
                    <div className="absolute top-2 left-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectionOrder}
                    </div>
                )}
                {compareMode && !isSelected && (
                    <div className="absolute top-2 left-2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">
                        <Check className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>

            <CardContent className="p-4 space-y-3">
                {/* ...existing card content... */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formattedTime}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Overall Score</div>
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                            {analysis.overall_score.toFixed(2)}%
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Head</div>
                            <div className={getScoreColor(analysis.head_position)}>{analysis.head_position.toFixed(2)}%</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Back</div>
                            <div className={getScoreColor(analysis.back_position)}>{analysis.back_position.toFixed(2)}%</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Foot Strike</div>
                            <div className={getScoreColor(analysis.foot_strike)}>{analysis.foot_strike.toFixed(2)}%</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-medium">Arm Flexion</div>
                            <div className={getScoreColor(analysis.arm_flexion)}>{analysis.arm_flexion.toFixed(2)}%</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-medium">Right Knee</div>
                            <div className={getScoreColor(analysis.right_knee)}>{analysis.right_knee.toFixed(2)}%</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-medium">Left Knee</div>
                            <div className={getScoreColor(analysis.left_knee)}>{analysis.left_knee.toFixed(2)}%</div>
                        </div>
                    </div>
                </div>

                {!compareMode && (
                    <Link href={`/dashboard/history/${analysis.id}`}>
                        <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-300">
                            View Details
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export default function HistoryPage() {
    const { history, isLoading, error } = useHistory();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "score">("date");

    // Compare mode state
    const [compareMode, setCompareMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectForCompare = (id: number) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 2) {
                // Replace the first selection
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const exitCompareMode = () => {
        setCompareMode(false);
        setSelectedIds([]);
    };

    // ...existing processed useMemo...
    const processedHistory = useMemo(() => {
        let filtered = history;

        if (searchTerm) {
            filtered = history.filter(item =>
                item.id.toString().includes(searchTerm) ||
                new Date(item.created_at).toLocaleDateString().includes(searchTerm)
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else {
                return b.overall_score - a.overall_score;
            }
        });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const groups = {
            today: filtered.filter(item => new Date(item.created_at) >= today),
            yesterday: filtered.filter(item => {
                const date = new Date(item.created_at);
                return date >= yesterday && date < today;
            }),
            thisWeek: filtered.filter(item => {
                const date = new Date(item.created_at);
                return date >= weekAgo && date < yesterday;
            }),
            thisMonth: filtered.filter(item => {
                const date = new Date(item.created_at);
                return date >= monthAgo && date < weekAgo;
            }),
            older: filtered.filter(item => new Date(item.created_at) < monthAgo),
        };

        return { groups, total: filtered.length };
    }, [history, searchTerm, sortBy]);

    // ...existing loading/error/empty states...

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <h3 className="text-lg font-semibold">Loading Your Analysis History</h3>
                        <p className="text-muted-foreground">Please wait while we fetch your running analyses...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error Loading History</h3>
                                <p className="text-sm text-red-800 mt-1">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <FileX className="h-12 w-12 text-gray-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">No Analysis History Yet</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Start analyzing your running form to build your performance history and track improvements over time.
                        </p>
                    </div>
                    <Link href="/dashboard/analyze">
                        <Button size="lg">
                            <Target className="h-4 w-4 mr-2" />
                            Start Your First Analysis
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Helper to render a group of cards
    const renderGroup = (items: typeof history, title: string, Icon: typeof Clock) => {
        if (items.length === 0) return null;
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title} ({items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(analysis => (
                        <HistoryCard
                            key={analysis.id}
                            analysis={analysis}
                            compareMode={compareMode}
                            isSelected={selectedIds.includes(analysis.id)}
                            selectionOrder={selectedIds.indexOf(analysis.id) + 1}
                            onSelect={handleSelectForCompare}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <RoleGuard allowedRoles={["user"]}>
            <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
                {/* Compare Mode Floating Bar */}
                {compareMode && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
                        <div className="text-sm">
                            <span className="font-medium">{selectedIds.length}/2</span> selected
                        </div>
                        <Separator orientation="vertical" className="h-6" />
                        <Button
                            variant="default"
                            disabled={selectedIds.length !== 2}
                            asChild
                        >
                            <Link href={`/dashboard/compare?first=${selectedIds[0]}&second=${selectedIds[1]}`}>
                                <GitCompare className="h-4 w-4 mr-2" />
                                Compare
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={exitCompareMode}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <History className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
                                <p className="text-muted-foreground">Track your running form progress over time</p>
                            </div>
                        </div>

                        {/* Compare Mode Toggle */}
                        {history.length >= 2 && (
                            <Button
                                variant={compareMode ? "secondary" : "outline"}
                                onClick={() => compareMode ? exitCompareMode() : setCompareMode(true)}
                            >
                                <GitCompare className="h-4 w-4 mr-2" />
                                {compareMode ? "Cancel Compare" : "Compare Runs"}
                            </Button>
                        )}
                    </div>

                    {compareMode && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="py-3 px-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Compare Mode:</strong> Select two analyses to compare side by side. Click on cards to select them.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* ...existing controls... */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by ID or date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={sortBy === "date" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("date")}
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            By Date
                        </Button>
                        <Button
                            variant={sortBy === "score" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("score")}
                        >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            By Score
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-8">
                    {processedHistory.total === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                                    <h3 className="font-semibold text-gray-900 mb-2">No Results Found</h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search terms or clear the search to see all analyses.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {renderGroup(processedHistory.groups.today, "Today", Clock)}
                            {renderGroup(processedHistory.groups.yesterday, "Yesterday", Calendar)}
                            {renderGroup(processedHistory.groups.thisWeek, "This Week", Calendar)}
                            {renderGroup(processedHistory.groups.thisMonth, "This Month", Calendar)}
                            {renderGroup(processedHistory.groups.older, "Older Analyses", History)}
                        </>
                    )}
                </div>

                {/* Quick Action */}
                <div className="text-center pt-8 border-t">
                    <Link href="/dashboard/analyze">
                        <Button size="lg">
                            <Target className="h-4 w-4 mr-2" />
                            Analyze New Video
                        </Button>
                    </Link>
                </div>
            </div>
        </RoleGuard>
    );
}