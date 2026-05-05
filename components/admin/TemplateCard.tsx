import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ThumbsDown, ThumbsUp, Layers } from "lucide-react";
import type { DrillTemplate } from "@/hooks/drills/use-drill-templates";

interface TemplateCardProps {
    template: DrillTemplate;
    onClick: (template: DrillTemplate) => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
    const score = template.helpful_count - template.not_helpful_count;
    const stepCount = template.instructions?.steps?.length ?? 0;

    return (
        <button
            className="group block h-full w-full text-left"
            onClick={() => onClick(template)}
        >
            <Card className="glass-card h-full flex flex-col border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                {/* Header illustration */}
                <div className="h-32 bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-950 dark:to-violet-900 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {template.thumbnail_url ? (
                        <img 
                            src={template.thumbnail_url} 
                            alt={template.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                    ) : (
                        <BookOpen className="h-10 w-10 text-indigo-400 dark:text-indigo-500 group-hover:scale-110 transition-transform" />
                    )}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {template.drills_count > 0 && (
                        <div className="absolute bottom-2 left-2">
                            <Badge className="bg-indigo-500/90 text-white border-none text-[10px] flex items-center gap-1">
                                <Layers className="h-2.5 w-2.5" />
                                {template.drills_count} {template.drills_count === 1 ? "assignment" : "assignments"}
                            </Badge>
                        </div>
                    )}
                </div>

                <CardContent className="pt-4 flex-grow">
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors mb-2">
                        {template.name || "Untitled Template"}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {stepCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                                {stepCount} {stepCount === 1 ? "step" : "steps"}
                            </Badge>
                        )}
                        {template.video_url && (
                            <Badge variant="outline" className="text-[10px] opacity-70">
                                Has video
                            </Badge>
                        )}
                        {template.justification && (
                            <Badge variant="outline" className="text-[10px] opacity-70">
                                Has justification
                            </Badge>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                            <span>{template.helpful_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                            <span>{template.not_helpful_count}</span>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${score > 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : score < 0
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                        {score > 0 ? "+" : ""}{score}
                    </span>
                </CardFooter>
            </Card>
        </button>
    );
}
