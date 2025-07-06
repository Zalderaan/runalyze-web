'use client'

import { useEffect, useRef, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
interface AnalysisDetails {
    id: number;
    created_at: string;
    head_position: number;
    back_position: number;
    arm_flexion: number;
    right_knee: number;
    left_knee: number;
    foot_strike: number;
    overall_score: number;
    video_id: number;
    user_id: number;
}

export default function AnalysisDetails() {
    const [ analysisDetails, setAnalysisDetails ] = useState<AnalysisDetails | null>(null);
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
    const {id, video_id, user_id, overall_score, head_position, back_position, arm_flexion, right_knee, left_knee, foot_strike} = analysisDetails || {};

    if (isLoadingDetails == true && analysisDetails == null) {
        return (
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        )
    }
    return (
        <>  

            Analysis Details ID: {analysisId}
        </>
    );
}