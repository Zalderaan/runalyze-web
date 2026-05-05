'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    ExternalLink,
    Film,
    Layers,
    ListChecks,
    Quote,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import type { DrillTemplate } from "@/hooks/drills/use-drill-templates";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditTemplateDialog } from "./EditTemplateDialog";

import type { Drill } from "@/hooks/drills/use-drills";
import { EditDrillDialog } from "./EditDrillDialog";
import { AddDrillDialog } from "./AddDrillDialog";

interface TemplateDetailSheetProps {
    template: DrillTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTemplateUpdated?: () => void;
}

export function TemplateDetailSheet({ template, open, onOpenChange, onTemplateUpdated }: TemplateDetailSheetProps) {
    const [assignments, setAssignments] = useState<Drill[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const isMobile = useIsMobile();

    function fetchAssignments() {
        if (!template) return;
        setLoadingAssignments(true);

        fetch(`/api/admin/drills?template_id=${template.id}&limit=50`)
            .then((r) => r.json())
            .then((data) => setAssignments(data.drills ?? []))
            .catch(() => setAssignments([]))
            .finally(() => setLoadingAssignments(false));
    }

    useEffect(() => {
        if (!template || !open) return;
        fetchAssignments();
    }, [template, open]);

    if (!template) return null;

    const score = template.helpful_count - template.not_helpful_count;
    const steps = template.instructions?.steps ?? [];

    const formatArea = (area: string) =>
        area.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const Content = (
        <>
            {/* Coloured header */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-indigo-950 dark:to-violet-900 p-6 flex-shrink-0">
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-white/60 dark:bg-black/30 rounded-xl">
                                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {isMobile ? (
                                    <>
                                        <DrawerTitle className="text-lg font-bold leading-tight">
                                            {template.name}
                                        </DrawerTitle>
                                        <DrawerDescription className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">
                                            Created {new Date(template.created_at).toLocaleDateString()}
                                        </DrawerDescription>
                                    </>
                                ) : (
                                    <>
                                        <SheetTitle className="text-lg font-bold leading-tight">
                                            {template.name}
                                        </SheetTitle>
                                        <SheetDescription className="text-xs mt-1">
                                            Created {new Date(template.created_at).toLocaleDateString()}
                                        </SheetDescription>
                                    </>
                                )}
                            </div>
                        </div>
                        <EditTemplateDialog template={template} onSuccess={onTemplateUpdated} />
                    </div>

                    {/* Feedback chips */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                            <ThumbsUp className="h-3 w-3" />
                            {template.helpful_count} helpful
                        </div>
                        <div className="flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                            <ThumbsDown className="h-3 w-3" />
                            {template.not_helpful_count} not helpful
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${score > 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : score < 0
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}>
                            Score: {score > 0 ? "+" : ""}{score}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrollable body */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-6">
                    {/* Instructions */}
                    {steps.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <ListChecks className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">Instructions</h3>
                                <Badge variant="secondary" className="text-[10px]">{steps.length} steps</Badge>
                            </div>
                            <ol className="flex flex-col gap-2">
                                {steps.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2">
                                        <span className="font-bold text-primary text-xs mt-0.5 flex-shrink-0">{idx + 1}.</span>
                                        <span className="text-zinc-700 dark:text-zinc-300">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Justification */}
                    {template.justification && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Quote className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">Justification</h3>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                                {template.justification}
                            </p>
                        </section>
                    )}

                    {/* Reference */}
                    {template.reference && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <ExternalLink className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">Reference</h3>
                            </div>
                            <a
                                href={template.reference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 break-all"
                            >
                                {template.reference}
                            </a>
                        </section>
                    )}

                    {/* Video */}
                    {template.video_url && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Film className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-sm">Video Demo</h3>
                            </div>
                            <video
                                controls
                                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
                                src={template.video_url}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </section>
                    )}

                    <Separator />

                    {/* Drill Assignments */}
                    <section>
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-indigo-500" />
                                <h3 className="font-semibold text-sm">Drill Assignments</h3>
                                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none text-[10px]">
                                    {template.drills_count}
                                </Badge>
                            </div>

                            <AddDrillDialog
                                key={template.id}
                                defaultTemplate={template}
                                onSuccess={() => {
                                    fetchAssignments();
                                    onTemplateUpdated?.(); // Refresh the main template list to update counts
                                }}
                            />
                        </div>

                        {loadingAssignments ? (
                            <div className="flex flex-col gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                                ))}
                            </div>
                        ) : assignments.length === 0 ? (
                            <p className="text-sm text-zinc-400 italic">No drill assignments use this template yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {assignments.map((drill) => (
                                    <div
                                        key={drill.id}
                                        className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3"
                                    >
                                        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                                                {formatArea(drill.area)}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] opacity-70">
                                                {drill.performance_level}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 flex-shrink-0">
                                            {drill.sets != null && (
                                                <span className="font-medium">{drill.sets} sets</span>
                                            )}
                                            {drill.reps != null && (
                                                <span>{drill.reps} {drill.rep_type ?? "reps"}</span>
                                            )}
                                            {drill.frequency != null && (
                                                <span>{drill.frequency}×/wk</span>
                                            )}
                                            <EditDrillDialog drill={drill} onSuccess={fetchAssignments} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </ScrollArea>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-full flex flex-col p-0 overflow-y-auto">
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>{template.name}</DrawerTitle>
                        <DrawerDescription>Template details</DrawerDescription>
                    </DrawerHeader>
                    {Content}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>{template.name}</SheetTitle>
                    <SheetDescription>Template details</SheetDescription>
                </SheetHeader>
                {Content}
            </SheetContent>
        </Sheet>
    );
}

