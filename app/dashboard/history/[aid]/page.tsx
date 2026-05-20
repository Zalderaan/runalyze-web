'use client'

import { useEffect, useRef, useState } from "react";
import { useHistory } from "@/hooks/use-history";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAchievementsForRun } from "@/lib/badges.config";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon, Pencil, Loader2, Download } from "lucide-react";
import { AreaScore } from "@/components/history/area-score";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DrillCardDialog } from "./DrillCardDialog";
import { RoleGuard } from "@/components/RoleGuard";
interface DetailedFeedback {
    head_position: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string
    };
    back_position: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string

    };
    arm_flexion: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string

    };
    right_knee: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string

    };
    left_knee: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string

    };
    foot_strike: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
        classification: string;
        justification: string

    };
}

// interface Video {
//     video_id: number;
//     user_id: number;
//     analysis_results_id: number;
//     video_url: string;
//     thumbnail_url: string;
//     uploaded_at: Date;
// }

interface AnalysisDetails {
    id: number;
    user_id: number;
    video_id: number;
    video_url: string;
    thumbnail_url?: string;
    created_at: string;
    head_position: number;
    back_position: number;
    arm_flexion: number;
    right_knee: number;
    left_knee: number;
    foot_strike: number;
    overall_score: number;
    overall_assessment: string;
    name?: string;
    fatigue_level?: number | null;
    bmi_category: "underweight" | "normal" | "overweight" | "obese";
    detailed_feedback: DetailedFeedback;
}

export default function AnalysisDetails() {
    const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);

    const {
        history, fetchHistory,
        getAnalysisDetails, isLoadingDetails,
        deleteAnalysis, isLoadingDelete, 
        renameAnalysis,
        updateFatigueLevel
    } = useHistory();
    const params = useParams();
    const analysisId = params.aid as string;

    const fetchedHistoryRef = useRef(false);
    useEffect(() => {
        if (!fetchedHistoryRef.current && history.length === 0) {
            fetchHistory();
            fetchedHistoryRef.current = true;
        }
    }, [fetchHistory, history.length]);

    const fetchedRef = useRef(false);
    useEffect(() => {
        if (fetchedRef.current || !analysisId) return;
        fetchedRef.current = true; // Add this line

        async function fetchDetails() {
            if (analysisId) {
                const details = await getAnalysisDetails(analysisId);
                // console.log(details);
                setAnalysisDetails(details);
                if (details) {
                    setEditedName(details.name || `Analysis #${details.id}`);
                }
            }
        }

        fetchDetails();
    }, [analysisId, getAnalysisDetails]);

    // console.log(analysisDetails);
    const { id, video_url, overall_score, overall_assessment, detailed_feedback, bmi_category, name, fatigue_level } = analysisDetails || {};
    // head_position, back_position, arm_flexion, right_knee, left_knee, foot_strike 

    const [currentFatigue, setCurrentFatigue] = useState<number | null>(null);
    useEffect(() => {
        if (analysisDetails) {
            setCurrentFatigue(analysisDetails.fatigue_level ?? null);
        }
    }, [analysisDetails]);

    const [isSavingFatigue, setIsSavingFatigue] = useState(false);

    const handleFatigueChange = async (level: number) => {
        setCurrentFatigue(level);
        setIsSavingFatigue(true);
        try {
            await updateFatigueLevel(Number(analysisId), level);
            setAnalysisDetails(prev => prev ? { ...prev, fatigue_level: level } : prev);
        } catch (error) {
            console.error("Failed to update fatigue level");
        } finally {
            setIsSavingFatigue(false);
        }
    }

    const router = useRouter();

    const handleDelete = async () => {
        const result = await deleteAnalysis(analysisId);
        if (result?.success) {
            router.push('/dashboard/history')
        } else {
            console.error('Delete failed: ', result?.message);
        }
    };

    const handleSaveName = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const fallbackName = name || `Analysis #${id}`;
        if (editedName.trim() === "" || editedName === fallbackName) {
            setIsEditingName(false);
            setEditedName(fallbackName);
            return;
        }

        setIsSavingName(true);
        const result = await renameAnalysis(Number(analysisId), editedName.trim());
        if (result.success) {
            setAnalysisDetails(prev => prev ? { ...prev, name: editedName.trim() } : prev);
            setIsEditingName(false);
        } else {
            setEditedName(fallbackName);
            setIsEditingName(false);
        }
        setIsSavingName(false);
    };

    // const handleDrillFeedback = async (isHelpful: boolean) => {
    //     const drillFeedbackValue = isHelpful ? 'helpful' : 'not_helpful';
    //     setFeedback(drillFeedbackValue);

    //     try {

    //     } catch(error) {
    //         console.error("Error submitting feedback: ", error)
    //     }
    // }

    if (isLoadingDetails == true && analysisDetails == null) {
        return (
            <div className="space-y-8 w-full">
                {/* Overall Score Header Skeleton */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-8 w-40 mb-2 bg-gray-300/50" />
                            <Skeleton className="h-4 w-80 bg-gray-200/66" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-4 w-24 mb-2 bg-gray-200/50" />
                            <Skeleton className="h-10 w-16 bg-blue-200/50" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Video Section Skeleton */}
                    <div className="xl:col-span-2">
                        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                            <Skeleton className="w-full h-[400px] lg:h-[500px] bg-gray-600" />
                        </div>
                    </div>

                    {/* Analysis Metrics Skeleton */}
                    <div className="xl:col-span-1">
                        <Skeleton className="h-6 w-32 mb-4 bg-gray-300/50" />
                        <div className="grid grid-cols-1 gap-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-24 mb-2 bg-gray-300/50" />
                                        <Skeleton className="h-3 w-full bg-gray-200/66" />
                                        <Skeleton className="h-3 w-4/5 bg-gray-200/66 mt-1" />
                                    </div>
                                    <div className="ml-4 text-right">
                                        <Skeleton className="h-8 w-12 mb-2 bg-gray-200" />
                                        <Skeleton className="h-5 w-16 bg-gray-100 rounded-full" />
                                    </div>
                                </div>
                            ))}

                            {/* Delete Button Skeleton */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <Skeleton className="h-10 w-full bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drills Section Skeleton */}
                <div className="w-full">
                    <Skeleton className="h-8 w-48 mb-6 bg-gray-300/50" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-6 bg-white shadow-sm">
                                {/* Card Header */}
                                <div className="mb-4">
                                    <Skeleton className="h-6 w-3/4 mb-2 bg-gray-300/50" />
                                    <Skeleton className="h-4 w-1/2 bg-blue-200/50" />
                                </div>
                                {/* Instructions */}
                                <div className="mb-4">
                                    <Skeleton className="h-4 w-20 mb-2 bg-gray-300/50" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-full bg-gray-200/66" />
                                        <Skeleton className="h-3 w-5/6 bg-gray-200/66" />
                                        <Skeleton className="h-3 w-4/5 bg-gray-200/66" />
                                    </div>
                                </div>
                                {/* Duration and Frequency */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Skeleton className="h-4 w-16 mb-1 bg-gray-300/50" />
                                        <Skeleton className="h-3 w-full bg-gray-200/66" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-4 w-16 mb-1 bg-gray-300/50" />
                                        <Skeleton className="h-3 w-full bg-gray-200/66" />
                                    </div>
                                </div>
                                {/* Focus Note */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <Skeleton className="h-3 w-full bg-blue-200/50" />
                                    <Skeleton className="h-3 w-4/5 bg-blue-200/50 mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    // Ideal angle ranges — mirrors RFAnalyzer.py ideal_angles (L5-L12)
    const IDEAL_RANGES: Record<string, string> = {
        head_position: "10° – 20°",
        back_position: "6° – 12°",
        arm_flexion: "70° – 90°",
        left_knee: "80° – 120°",
        right_knee: "120° – 170°",
        foot_strike: "5° – 10°",
    };

    const FATIGUE_LABELS: Record<number, string> = {
        1: "Fresh (🔋)",
        2: "Good (🙂)",
        3: "Normal (😐)",
        4: "Tired (😮‍💨)",
        5: "Exhausted (🪫)",
    };

    const AREA_ORDER = [
        "head_position",
        "back_position",
        "arm_flexion",
        "right_knee",
        "left_knee",
        "foot_strike",
    ] as const;

    const AREA_LABELS: Record<string, string> = {
        head_position: "Head Position",
        back_position: "Back Position",
        arm_flexion: "Arm Flexion",
        right_knee: "Front Knee (Landing)",
        left_knee: "Back Knee (Heel Kick)",
        foot_strike: "Foot Strike",
    };

    /** Escape a CSV cell value: wrap in quotes and escape internal quotes. */
    const csvCell = (value: string | number | undefined | null): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        // If it contains a comma, newline, or quote — wrap in double-quotes
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportToCSV = () => {
        if (!analysisDetails || !detailed_feedback) return;

        const generatedAt = new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const fatigueText = currentFatigue
            ? FATIGUE_LABELS[currentFatigue] ?? "Not recorded"
            : "Not recorded";

        // ── Summary header block ──────────────────────────────────────────
        const headerRows = [
            ["RUNNING FORM ANALYSIS REPORT"],
            ["Generated:", csvCell(generatedAt)],
            ["Analysis Name:", csvCell(name || `Analysis #${id}`)],
            ["Overall Score:", csvCell(`${overall_score?.toFixed(0)}%`)],
            ["Fatigue During Run:", csvCell(fatigueText)],
            ["Overall Assessment:", csvCell(overall_assessment)],
            [], // blank separator
        ];

        // ── Column headers ────────────────────────────────────────────────
        const columnHeaders = [
            "Metric",
            "Score (%)",
            "Performance Level",
            "Classification",
            "Your Angle (°)",
            `Ideal Range (°)`,
            "Feedback / Coaching Note",
        ];

        // ── Data rows ─────────────────────────────────────────────────────
        const dataRows = AREA_ORDER.map((area) => {
            const data = (detailed_feedback as any)[area];
            if (!data) return [AREA_LABELS[area], "", "", "", "", "", ""];
            return [
                csvCell(AREA_LABELS[area]),
                csvCell(Math.round(data.score)),
                csvCell(data.performance_level),
                csvCell(data.classification),
                csvCell(data.angle !== undefined ? Math.round(data.angle) : ""),
                csvCell(IDEAL_RANGES[area] ?? ""),
                csvCell(data.analysis),
            ];
        });

        // ── Assemble ──────────────────────────────────────────────────────
        const allRows = [
            ...headerRows.map((r) => r.join(",")),
            columnHeaders.map(csvCell).join(","),
            ...dataRows.map((r) => r.join(",")),
        ];

        const csvContent = allRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateSlug = new Date().toISOString().split("T")[0];
        const safeName = (name || `analysis-${id}`)
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase();
        link.setAttribute("href", url);
        link.setAttribute("download", `runalyze-${safeName}-${dateSlug}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Get all drills from areas that need improvement
    const getAllDrills = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allDrills: any[] = [];
        if (detailed_feedback) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.entries(detailed_feedback).forEach(([area, data]: [string, any]) => {
                if (data.drills && data.drills.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.drills.forEach((drill: any) => {
                        allDrills.push({
                            ...drill,
                            area: area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        });
                    });
                }
            });
        }
        return allDrills;
    };

    // Helper function to get score color classes
    // const getScoreColors = (score: number | undefined) => {
    //     if (!score && score !== 0) return { text: 'text-gray-600', bg: 'bg-gray-100 text-gray-700' };
    //     if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100 text-green-700' };
    //     if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100 text-yellow-700' };
    //     return { text: 'text-red-600', bg: 'bg-red-100 text-red-700' };
    // };

    const drills = getAllDrills();
    const runBadges = analysisId && history.length > 0 
        ? getAchievementsForRun(Number(analysisId), history) 
        : [];

    return (
        <RoleGuard allowedRoles={["user"]}>
            <div className="space-y-8 w-full">
                {/* Overall Score Header */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-px shadow-xl">
                    <div className="relative rounded-2xl bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/90 backdrop-blur-sm px-6 py-5">
                        {/* Decorative blobs */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl" />

                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Left — title & assessment */}
                            <div className="flex-1 min-w-0 w-full text-center md:text-left">
                                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Run Analysis</p>
                                
                                {isEditingName ? (
                                    <form onSubmit={handleSaveName} className="flex items-center gap-2 mb-2">
                                        <Input
                                            value={editedName}
                                            onChange={e => setEditedName(e.target.value)}
                                            className="h-10 text-xl font-bold bg-white/80 text-gray-900 border-blue-300 w-full max-w-sm"
                                            autoFocus
                                            disabled={isSavingName}
                                        />
                                        <Button type="submit" variant="secondary" disabled={isSavingName} className="gap-2 shrink-0 h-10">
                                            {isSavingName && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                                            Save
                                        </Button>
                                    </form>
                                ) : (
                                    <div 
                                        className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer w-full md:w-fit"
                                        onClick={() => setIsEditingName(true)}
                                    >
                                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                                            {name || `Analysis #${id}`}
                                        </h1>
                                        <Pencil className="h-4 w-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                                
                                <p className="text-sm text-gray-500 mt-2 mb-4 leading-relaxed line-clamp-3 mx-auto md:mx-0 max-w-2xl">{overall_assessment}</p>

                                {runBadges.length > 0 && (
                                    <TooltipProvider delayDuration={200}>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 pb-2">
                                            {runBadges.map((badgeDef) => {
                                                const Icon = badgeDef.icon;
                                                return (
                                                    <Tooltip key={badgeDef.id}>
                                                        <TooltipTrigger className="cursor-default">
                                                            <div 
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50/80 border border-blue-100 hover:bg-blue-100 transition-colors backdrop-blur-md shadow-sm"
                                                            >
                                                                <Icon className={`h-4 w-4 ${badgeDef.color}`} />
                                                                <span className="text-xs font-bold text-blue-900 leading-none tracking-tight">{badgeDef.name}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[220px] bg-gray-900 text-white border-0 shadow-lg p-2.5">
                                                            <p className="font-semibold text-sm mb-1 leading-none">{badgeDef.name}</p>
                                                            <p className="text-xs opacity-80 leading-snug text-balance">{badgeDef.description}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            })}
                                        </div>
                                    </TooltipProvider>
                                )}
                            </div>

                            {/* Right — Score and BMI group */}
                            <div className="flex flex-wrap items-center justify-center gap-8 w-full md:w-auto shrink-0">
                                {/* Centre — circular score */}
                                <div className="flex flex-col items-center gap-2 shrink-0">
                                    {/* Outer ring */}
                                    <div
                                        className="relative flex items-center justify-center rounded-full shadow-lg"
                                        style={{
                                            width: 96,
                                            height: 96,
                                            background: `conic-gradient(
                                                ${(overall_score ?? 0) >= 80 ? '#22c55e' : (overall_score ?? 0) >= 60 ? '#f59e0b' : '#ef4444'} ${(overall_score ?? 0) * 3.6}deg,
                                                #e2e8f0 0deg
                                            )`,
                                            borderRadius: '50%',
                                            padding: 5,
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center rounded-full bg-white w-full h-full">
                                            <span
                                                className="text-2xl font-extrabold leading-none"
                                                style={{
                                                    color: (overall_score ?? 0) >= 80 ? '#16a34a' : (overall_score ?? 0) >= 60 ? '#d97706' : '#dc2626',
                                                }}
                                            >
                                                {overall_score?.toFixed(0)}
                                            </span>
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">/ 100</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Overall Score</span>
                                </div>

                                {/* Right — BMI badge */}
                                {bmi_category && (
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Body Type</span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${bmi_category === "normal" ? "bg-green-50 text-green-700 border-green-300" :
                                            bmi_category === "underweight" ? "bg-blue-50 text-blue-700 border-blue-300" :
                                                bmi_category === "overweight" ? "bg-amber-50 text-amber-700 border-amber-300" :
                                                    "bg-red-50 text-red-700 border-red-300"
                                            }`}>
                                            <span>
                                                {bmi_category === "normal" ? "✅" :
                                                    bmi_category === "underweight" ? "💧" :
                                                        bmi_category === "overweight" ? "⚠️" : "🔴"}
                                            </span>
                                            BMI · {bmi_category.charAt(0).toUpperCase() + bmi_category.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fatigue Context Component */}
                {currentFatigue === null ? (
                    <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contextualize this analysis: How were you feeling during this run?</h3>
                        <div className="flex gap-2 relative">
                            {isSavingFatigue && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10 backdrop-blur-[1px]">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                </div>
                            )}
                            {[
                                { level: 1, label: "Fresh", emoji: "🔋" },
                                { level: 2, label: "Good", emoji: "🙂" },
                                { level: 3, label: "Normal", emoji: "😐" },
                                { level: 4, label: "Tired", emoji: "😮‍💨" },
                                { level: 5, label: "Exhausted", emoji: "🪫" },
                            ].map(item => (
                                <button
                                    key={item.level}
                                    onClick={() => handleFatigueChange(item.level)}
                                    disabled={isSavingFatigue}
                                    className="flex-1 flex flex-col items-center py-2 px-1 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 grayscale hover:grayscale-0"
                                >
                                    <span className="text-2xl mb-1">{item.emoji}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hidden sm:block">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className={`p-4 rounded-xl border flex items-start gap-4 ${
                            currentFatigue >= 4 ? 'bg-orange-50 border-orange-200' 
                            : currentFatigue === 1 ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-100'
                        }`}>
                            <div className="text-3xl mt-0.5">
                                {currentFatigue === 1 && "🔋"}
                                {currentFatigue === 2 && "🙂"}
                                {currentFatigue === 3 && "😐"}
                                {currentFatigue === 4 && "😮‍💨"}
                                {currentFatigue === 5 && "🪫"}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-lg mb-1 leading-none ${
                                        currentFatigue >= 4 ? 'text-orange-900' 
                                        : currentFatigue === 1 ? 'text-green-900'
                                        : 'text-blue-900'
                                    }`}>
                                        Fatigue Context: {
                                            currentFatigue === 1 ? "Fresh" :
                                            currentFatigue === 2 ? "Good" :
                                            currentFatigue === 3 ? "Normal" :
                                            currentFatigue === 4 ? "Tired" : "Exhausted"
                                        }
                                    </h3>
                                    <button 
                                        onClick={() => setCurrentFatigue(null)} 
                                        className={`text-[10px] font-bold uppercase tracking-wider underline opacity-60 hover:opacity-100 transition-opacity ${
                                            currentFatigue >= 4 ? 'text-orange-900' 
                                            : currentFatigue === 1 ? 'text-green-900'
                                            : 'text-blue-900'
                                        }`}
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className={`text-sm opacity-90 leading-relaxed mt-1 ${
                                    currentFatigue >= 4 ? 'text-orange-900' 
                                    : currentFatigue === 1 ? 'text-green-900'
                                    : 'text-blue-900'
                                }`}>
                                    {currentFatigue >= 4 ? (
                                        (overall_score ?? 0) < 70 
                                            ? "You reported feeling exhausted during this run. It's completely normal for biomechanics—especially back posture and core stability—to break down under high fatigue. Don't stress too much about these form scores; focus on recovery!"
                                            : "You reported feeling exhausted, yet you maintained incredible form! Your muscular endurance is clearly a strong point. Way to hold it together."
                                    ) : currentFatigue === 1 ? (
                                        (overall_score ?? 0) < 70
                                            ? "You reported feeling fresh, but your form scores are lower than expected. This indicates a genuine technical focal point rather than a stamina issue. Dive deep into the drills below!"
                                            : "You felt fresh and your form reflects it! You executed this run with fantastic biomechanics from the start."
                                    ) : "You felt relatively normal during this run. The analysis below reflects your reliable baseline running mechanics outside of heavy exhaustion."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Analysis — 3 cols × 2 rows */}
                <div className="w-full">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Form Analysis</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AreaScore
                            area="Head Position"
                            score={detailed_feedback?.head_position?.score ?? 0}
                            analysis={detailed_feedback?.head_position?.analysis ?? ""}
                            perf_level={detailed_feedback?.head_position?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.head_position?.classification ?? ""}
                        />
                        <AreaScore
                            area="Back Position"
                            score={detailed_feedback?.back_position?.score ?? 0}
                            analysis={detailed_feedback?.back_position?.analysis ?? ""}
                            perf_level={detailed_feedback?.back_position?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.back_position?.classification ?? ""}
                        />
                        <AreaScore
                            area="Arm Flexion"
                            score={detailed_feedback?.arm_flexion?.score ?? 0}
                            analysis={detailed_feedback?.arm_flexion?.analysis ?? ""}
                            perf_level={detailed_feedback?.arm_flexion?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.arm_flexion?.classification ?? ""}
                        />
                        <AreaScore
                            area="Front Knee (Landing)"
                            score={detailed_feedback?.right_knee?.score ?? 0}
                            analysis={detailed_feedback?.right_knee?.analysis ?? ""}
                            perf_level={detailed_feedback?.right_knee?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.right_knee?.classification ?? ""}
                        />
                        <AreaScore
                            area="Back Knee (Heel Kick)"
                            score={detailed_feedback?.left_knee?.score ?? 0}
                            analysis={detailed_feedback?.left_knee?.analysis ?? ""}
                            perf_level={detailed_feedback?.left_knee?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.left_knee?.classification ?? ""}
                        />
                        <AreaScore
                            area="Foot Strike"
                            score={detailed_feedback?.foot_strike?.score ?? 0}
                            analysis={detailed_feedback?.foot_strike?.analysis ?? ""}
                            perf_level={detailed_feedback?.foot_strike?.performance_level ?? "Unknown"}
                            classification={detailed_feedback?.foot_strike?.classification ?? ""}
                        />
                    </div>
                </div>

                {/* Video Section — full width */}
                <div className="w-full">
                    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                        <video
                            src={video_url}
                            controls
                            className="w-full max-h-[560px] object-contain bg-black"
                            poster={analysisDetails?.thumbnail_url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>



                {/* Delete — danger zone */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    {/* Export Report */}
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={exportToCSV}
                        disabled={!detailed_feedback}
                    >
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="flex items-center gap-2"
                                disabled={isLoadingDelete}
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete Analysis
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>This action will remove this analysis from your account.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button asChild variant={'outline'}>
                                    <DialogClose>
                                        Go back
                                    </DialogClose>
                                </Button>
                                <Button
                                    variant={'destructive'}
                                    onClick={handleDelete}
                                    disabled={isLoadingDelete}
                                >
                                    {isLoadingDelete ? "Deleting..." : "Yes, delete this analysis"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Recommended Drills Section */}
                {drills.length > 0 && (
                    <div className="w-full">
                        <h2 className="text-2xl font-bold mb-6">Recommended Drills</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {drills.map((drill, index) => (
                                <Card key={index} className="h-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-xl">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight flex-1">
                                                {drill.drill_name || "Untitled Drill"}
                                            </CardTitle>
                                            <DrillCardDialog drillId={drill.id} drillName={drill.drill_name} reason={drill.justification} />
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    drill.performance_recommendation?.priority_level === "high"
                                                        ? "bg-red-50 text-red-700 border-red-300"
                                                        : drill.performance_recommendation?.priority_level === "medium"
                                                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                                            : "bg-gray-50 text-gray-700 border-gray-300"
                                                }
                                            >
                                                <span className="mr-1">
                                                    {drill.performance_recommendation?.priority_level === "high" ? "🔴" :
                                                        drill.performance_recommendation?.priority_level === "medium" ? "🟡" : "⚪"}
                                                </span>
                                                {drill.performance_recommendation?.priority_level?.charAt(0).toUpperCase() +
                                                    drill.performance_recommendation?.priority_level?.slice(1) || 'Medium'} Priority
                                            </Badge>
                                            <Badge variant="secondary" className="capitalize shrink-0 text-xs">
                                                {drill.area}
                                            </Badge>

                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center min-h-[180px]">
                                            {drill.video_url
                                                ? (
                                                    <video 
                                                        src={drill.video_url} 
                                                        controls 
                                                        className="w-full max-h-60 object-contain bg-black rounded" 
                                                        poster={drill.thumbnail_url}
                                                    />
                                                )
                                                : <div className="text-gray-400 italic py-8">No video provided</div>
                                            }
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <h4 className="font-medium text-sm text-gray-700 mb-2">Instructions:</h4>
                                            {Array.isArray(drill.instructions?.steps) ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    {drill.instructions.steps.map((step: string, stepIndex: number) => (
                                                        <li key={stepIndex} className="text-sm text-gray-600">{step}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-600">{drill.instructions || "No instructions provided."}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-700">⏱ Duration:</span>
                                                <span className="text-gray-600 text-sm">{`${drill.sets} x ${drill.reps} ${drill.rep_type}` || "-"}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-700">🔁 Frequency:</span>
                                                <span className="text-gray-600">{`${drill.frequency}x/week` || "-"}</span>
                                            </div>
                                        </div>
                                        {drill.area_focus_note && (
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <span className="font-medium">Focus: </span>
                                                    {drill.area_focus_note}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}