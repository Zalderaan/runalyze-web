// import { useGetTopDrills } from "@/hooks/drills/use-get-top-drills";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Trophy, Loader2, AlertCircle } from "lucide-react";

interface TopDrill {
    id: number;
    drill_name: string;
    area: string;
    performance_level: string;
    helpful_count: number;
    not_helpful_count: number;
}

interface TopDrillsListProps {
    topDrills: TopDrill[];
    isLoading: boolean;
    error: string | null;
}

export function TopDrillsList({ topDrills, isLoading, error }: TopDrillsListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">Loading top drills...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-6 text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Failed to load drills</span>
            </div>
        );
    }

    if (!topDrills || topDrills.length === 0) {
        return (
            <div className="text-sm text-gray-500 text-center p-6">
                No drills found
            </div>
        );
    }

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
        if (index === 1) return <Trophy className="h-4 w-4 text-gray-400" />;
        if (index === 2) return <Trophy className="h-4 w-4 text-amber-600" />;
        return <span className="text-gray-500 font-medium">{index + 1}</span>;
    };

    const getLevelBadgeVariant = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-700";
            case "intermediate":
                return "bg-yellow-100 text-yellow-700";
            case "advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Drill Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Votes</TableHead>
                    <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {topDrills.map((drill, index) => (
                    <TableRow key={drill.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                            <div className="flex items-center justify-center w-6">
                                {getRankIcon(index)}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{drill.drill_name}</TableCell>
                        <TableCell className="text-gray-600">{drill.area}</TableCell>
                        <TableCell>
                            <Badge className={`${getLevelBadgeVariant(drill.performance_level)} border-0`}>
                                {drill.performance_level}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-3">
                                <span className="flex items-center gap-1 text-green-600">
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    {drill.helpful_count}
                                </span>
                                <span className="flex items-center gap-1 text-red-500">
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                    {drill.not_helpful_count}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <span>
                                {drill.helpful_count - drill.not_helpful_count}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}