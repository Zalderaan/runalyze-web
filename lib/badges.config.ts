import { Flag, Compass, Zap, CheckCircle2 } from "lucide-react";
import { HistoryItem } from "@/hooks/use-history";
import { ComponentType } from "react";

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: ComponentType<{ className?: string }>; // Lucide icon
    color: string;
    evaluate: (history: HistoryItem[]) => boolean; // Global unlock
    evaluateForRun: (run: HistoryItem, runIndex: number) => boolean; // Specific run unlock 
}

export const BADGES: BadgeDefinition[] = [
    {
        id: "first_steps",
        name: "First Steps",
        description: "Completed your first running analysis. Welcome aboard!",
        icon: Compass,
        color: "text-blue-500",
        evaluate: (history: HistoryItem[]) => history.length >= 1,
        evaluateForRun: (run: HistoryItem, runIndex: number) => runIndex === 0
    },
    {
        id: "dedicated_runner",
        name: "Dedicated Runner",
        description: "Log 5 total running analyses to really dial in your form.",
        icon: Flag,
        color: "text-green-500",
        evaluate: (history: HistoryItem[]) => history.length >= 5,
        evaluateForRun: (run: HistoryItem, runIndex: number) => runIndex === 4
    },
    {
        id: "form_fixer",
        name: "Form Fixer",
        description: "Achieve an overall score of 80% or higher. Great posture!",
        icon: CheckCircle2,
        color: "text-purple-500",
        evaluate: (history: HistoryItem[]) => history.some(item => item.overall_score >= 80),
        evaluateForRun: (run: HistoryItem) => run.overall_score >= 80
    },
    {
        id: "elite_stride",
        name: "Elite Stride",
        description: "Achieve a near-perfect overall score of 90% or higher. Perfection!",
        icon: Zap,
        color: "text-amber-500",
        evaluate: (history: HistoryItem[]) => history.some(item => item.overall_score >= 90),
        evaluateForRun: (run: HistoryItem) => run.overall_score >= 90
    }
];

export function getAchievementsForRun(runId: number, history: HistoryItem[]): BadgeDefinition[] {
    // Sort history chronologically to determine run indices
    const sortedHistory = [...history].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const runIndex = sortedHistory.findIndex(h => h.id === runId);

    if (runIndex === -1) return [];

    const run = sortedHistory[runIndex];
    return BADGES.filter(badge => badge.evaluateForRun(run, runIndex));
}
