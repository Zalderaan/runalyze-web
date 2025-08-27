'use client'

import { useEffect, useRef, useState } from "react";
import { useHistory } from "@/hooks/use-history";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { AreaScore } from "@/components/history/area-score";

interface DetailedFeedback {
    head_position: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
    back_position: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
    arm_flexion: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
    right_knee: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
    left_knee: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
    foot_strike: {
        angle: number;
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drills: any[];
        analysis: string;
        performance_level: string;
    };
}

interface Video {
    video_id: number;
    user_id: number;
    analysis_results_id: number;
    video_url: string;
    thumbnail_url: string;
    uploaded_at: Date;
}

interface Feedback {

}
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
    detailed_feedback: DetailedFeedback;
}

export default function AnalysisDetails() {
    const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);
    const {
        getAnalysisDetails, isLoadingDetails,
        deleteAnalysis, isLoadingDelete
    } = useHistory();
    const params = useParams();
    const analysisId = params.aid as string;

    const fetchedRef = useRef(false);
    useEffect(() => {
        if (fetchedRef.current || !analysisId) return;
        fetchedRef.current = true; // Add this line

        async function fetchDetails() {
            if (analysisId) {
                const details = await getAnalysisDetails(analysisId);
                console.log(details);
                setAnalysisDetails(details);
            }
        }

        fetchDetails();
    }, [analysisId, getAnalysisDetails]);

    console.log(analysisDetails);
    const { id, video_url,
        overall_score, overall_assessment, detailed_feedback,
        head_position, back_position, arm_flexion, right_knee, left_knee, foot_strike } = analysisDetails || {};

    const router = useRouter();

    const handleDelete = async () => {
        const result = await deleteAnalysis(analysisId);
        if (result?.success) {
            router.push('/dashboard/history')
        } else {
            console.error('Delete failed: ', result?.message);
        }
    };

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
    const getScoreColors = (score: number | undefined) => {
        if (!score && score !== 0) return { text: 'text-gray-600', bg: 'bg-gray-100 text-gray-700' };
        if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100 text-green-700' };
        if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100 text-yellow-700' };
        return { text: 'text-red-600', bg: 'bg-red-100 text-red-700' };
    };

    const drills = getAllDrills();

    return (
        <div className="space-y-8 w-full">
            {/* Overall Score Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analysis #{id}</h1>
                        <p className="text-gray-600 mt-1">{overall_assessment}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Overall Score</p>
                        <p className="text-4xl font-bold text-blue-600">{overall_score?.toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Video Section - Takes more space on larger screens */}
                <div className="xl:col-span-2">
                    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                        <video
                            src={video_url}
                            controls
                            className="w-full h-[400px] lg:h-[500px] object-contain bg-black"
                            poster={analysisDetails?.thumbnail_url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>

                {/* Analysis Metrics Grid - Optimized for vertical space */}
                <div className="xl:col-span-1">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Form Analysis</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <AreaScore
                            area="Head Position"
                            score={detailed_feedback?.head_position?.score ?? 0}
                            analysis={detailed_feedback?.head_position?.analysis ?? ""}
                            perf_level={detailed_feedback?.head_position?.performance_level ?? "Unknown"}
                        />

                        <AreaScore
                            area="Back Position"
                            score={detailed_feedback?.back_position?.score ?? 0}
                            analysis={detailed_feedback?.back_position?.analysis ?? ""}
                            perf_level={detailed_feedback?.back_position?.performance_level ?? "Unknown"}
                        />

                        <AreaScore
                            area="Arm Flexion"
                            score={detailed_feedback?.arm_flexion?.score ?? 0}
                            analysis={detailed_feedback?.arm_flexion?.analysis ?? ""}
                            perf_level={detailed_feedback?.arm_flexion?.performance_level ?? "Unknown"}
                        />

                        <AreaScore
                            area="Right Knee"
                            score={detailed_feedback?.right_knee?.score ?? 0}
                            analysis={detailed_feedback?.right_knee?.analysis ?? ""}
                            perf_level={detailed_feedback?.right_knee?.performance_level ?? "Unknown"}
                        />

                        <AreaScore
                            area="Left Knee"
                            score={detailed_feedback?.left_knee?.score ?? 0}
                            analysis={detailed_feedback?.left_knee?.analysis ?? ""}
                            perf_level={detailed_feedback?.left_knee?.performance_level ?? "Unknown"}
                        />

                        <AreaScore
                            area="Foot Strike"
                            score={detailed_feedback?.foot_strike?.score ?? 0}
                            analysis={detailed_feedback?.foot_strike?.analysis ?? ""}
                            perf_level={detailed_feedback?.foot_strike?.performance_level ?? "Unknown"}
                        />

                        {/* Delete Button positioned at bottom */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <Button
                                variant="destructive"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={handleDelete}
                                disabled={isLoadingDelete}
                            >
                                {isLoadingDelete ? (
                                    'Deleting...'
                                ) : (
                                    <>
                                        <TrashIcon className="h-4 w-4" />
                                        Delete Analysis
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Drills Section */}
            {drills.length > 0 && (
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-6">Recommended Drills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drills.map((drill, index) => (
                            <Card key={index} className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">{drill.area}</CardTitle>
                                    <CardDescription className="text-sm text-blue-600">
                                        Priority: {drill.performance_recommendation?.priority_level || 'Medium'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Instructions:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {drill.instructions?.steps?.map((step: string, stepIndex: number) => (
                                                <li key={stepIndex} className="text-sm text-gray-600">{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Duration:</span>
                                            <p className="text-gray-600">{drill.duration}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Frequency:</span>
                                            <p className="text-gray-600">{drill.frequency}</p>
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
    );
}