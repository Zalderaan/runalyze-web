import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsDown, ThumbsUp } from "lucide-react";


export interface DrillPreview {
    id: string | number,
    title: string,
    area: string,
    performance_level: string,
    helpful_count: number,
    not_helpful_count: number,
}

export function DrillsCard({ title, area, performance_level, id, helpful_count, not_helpful_count }: DrillPreview) {
    const score = helpful_count - not_helpful_count;
    
    return (
        <Link href={`/dashboard/admin/drills/${id}`} className="block w-full h-full">
            <Card>
                <CardContent>
                    <span className="font-medium">{title === '' ? 'No name' : `${title}`}</span>
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2">
                    <div className="flex flex-row items-center space-x-2">
                        <Badge>{area}</Badge>
                        <Badge variant={"secondary"}>{performance_level}</Badge>
                    </div>

                    {/* Feedback Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span>{helpful_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <span>{not_helpful_count}</span>
                        </div>
                        {score !== 0 && (
                            <span className={`text-xs font-medium ${score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {score > 0 ? '+' : ''}{score}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card >
        </Link>
    )
}