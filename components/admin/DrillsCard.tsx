import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsDown, ThumbsUp, Drill, ArrowRight } from "lucide-react";

export interface DrillPreview {
    id: string | number,
    title: string,
    area: string,
    performance_level: string,
    helpful_count: number,
    not_helpful_count: number,
    thumbnail_url?: string | null,
}

export function DrillsCard({ title, area, performance_level, id, helpful_count, not_helpful_count, thumbnail_url }: DrillPreview) {
    const score = helpful_count - not_helpful_count;

    return (
        <Link href={`/dashboard/admin/drills/${id}`} className="group block h-full">
            <Card className="glass-card h-full flex flex-col border-none shadow-md hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {thumbnail_url ? (
                        <img 
                            src={thumbnail_url} 
                            alt={title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                    ) : (
                        <Drill className="h-10 w-10 text-zinc-400 dark:text-zinc-500 group-hover:rotate-12 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <CardContent className="pt-4 flex-grow">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                            {title === '' ? 'Untitled Drill' : title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                            {area}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] opacity-70">
                            {performance_level}
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                            <span>{helpful_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                            <span>{not_helpful_count}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        Edit <ArrowRight className="h-3 w-3" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
