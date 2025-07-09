'use client'

import { useEffect, useRef, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";


interface AnalysisDetails {
    id: number;
    user_id: number;
    video_id: number;
    video_url: string;
    created_at: string;
    head_position: number;
    back_position: number;
    arm_flexion: number;
    right_knee: number;
    left_knee: number;
    foot_strike: number;
    overall_score: number;
}

export default function AnalysisDetails() {
    const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null);
    const { getAnalysisDetails, isLoadingDetails, detailsError } = useHistory();
    const params = useParams();
    const analysisId = params.aid as string;

    const fetchedRef = useRef(false);
    useEffect(() => {
        if (fetchedRef.current || !analysisId) return;

        async function fetchDetails() {
            if (analysisId) {
                const details = await getAnalysisDetails(analysisId);
                setAnalysisDetails(details);
            }
        }

        fetchDetails();
    }, [analysisId, getAnalysisDetails]);

    console.log(analysisDetails);
    const { id, video_id, user_id, overall_score, video_url, head_position, back_position, arm_flexion, right_knee, left_knee, foot_strike } = analysisDetails || {};

    if (isLoadingDetails == true && analysisDetails == null) {
        return (
            <div className="flex flex-row space-x-8 w-full">
                <Skeleton className="h-[400px] w-1/2" /> {/* // TODO: this will contain video thumbnail */}
                <div className="grid grid-cols-3 gap-4 items-center w-1/2"> {/* // TODO: this will contain analysis details */}
                    <div className="border rounded-lg px-4 py-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" /> {/* Title */}
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" /> {/* Score/value */}
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" /> {/* Description line 1 */}
                        <Skeleton className="h-4 w-4/5 bg-gray-100" /> {/* Description line 2 */}
                    </div>
                    <div className="border rounded-lg p-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" />
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" />
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" />
                        <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    </div>
                    <div className="border rounded-lg p-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" />
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" />
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" />
                        <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    </div>
                    <div className="border rounded-lg p-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" />
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" />
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" />
                        <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    </div>
                    <div className="border rounded-lg p-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" />
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" />
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" />
                        <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    </div>
                    <div className="border rounded-lg p-8 bg-gray-50 shadow-sm">
                        <Skeleton className="h-6 w-2/3 mb-2 bg-gray-300/50" />
                        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-200" />
                        <Skeleton className="h-4 w-full mb-1 bg-gray-200/66" />
                        <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-row space-x-8">
            <div className="flex flex-row justify-center items-center bg-gray-100 h-[400px] w-2/5">
                <video src={video_url} controls className="max-h-full max-w-full object-contain"></video>
            </div>

            <div className="flex w-1/5 h-full bg-red-200">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Overall Score</CardTitle>
                        <CardDescription>Testing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <span>{overall_score?.toFixed(0)} %</span>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center w-2/5">
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg p-4 py-8 shadow-sm">
                    <h4 className="font-medium">Head Position</h4>
                    <span className="font-bold text-4xl">{head_position?.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg px-4 py-8 shadow-sm">
                    <h4 className="font-medium">Back Position</h4>
                    <span className="font-bold text-4xl">{back_position?.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg px-4 py-8 shadow-sm">
                    <h4 className="font-medium">Arm Flexion</h4>
                    <span className="font-bold text-4xl">{arm_flexion?.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg px-4 py-8 shadow-sm">
                    <h4 className="font-medium">Right Knee</h4>
                    <span className="font-bold text-4xl">{right_knee?.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg px-4 py-8 shadow-sm">
                    <h4 className="font-medium">Left Knee</h4>
                    <span className="font-bold text-4xl">{left_knee?.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col justify-start bg-gray-50 h-full border rounded-lg px-4 py-8 shadow-sm">
                    <h4 className="font-medium">Foot Strike</h4>
                    <span className="font-bold text-4xl">{foot_strike?.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
}