/**
 * get user details from context
 * if 
 */

'use client'

import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Metric } from "./Metrics";

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
}

export interface Analysis {
    analysis: {
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
        thumbnail_url?: string;
    }
}

export function RunAnalysis({ analysis }: Analysis) {
    // format the date and time from created_at
    const createdAt = new Date(analysis.created_at);
    const formattedDate = createdAt.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Link 
            href={`/dashboard/history/${analysis.id}`}
            aria-label={`View analysis from ${formattedDate} with ${analysis.overall_score.toFixed(0)}% score`}   
        >
            <Card className="flex flex-col w-full h-full border-2 border-dashed cursor-pointer p-0 gap-0 rounded-(--card-radius) [--card-radius:var(--radius-xl)]">
                <CardHeader className="h-2/3 w-full p-0 rounded-t-(--card-radius)">
                    {
                        analysis.thumbnail_url ?
                            <Image
                                src={analysis.thumbnail_url}
                                // src={"/run1.jpg"}
                                alt='thumbnail'
                                width={200}
                                height={200}
                                className="rounded-t-(--card-radius) w-full h-full object-cover"
                            /> :
                            <div className="w-full h-full bg-red-200">test</div>
                    }
                </CardHeader>
                <CardContent
                    className="flex flex-col h-1/3 w-full justify-center items-center p-0 rounded-b-(--card-radius)"
                >
                    {/* <SquarePlus /> */}
                    <div className="w-full h-full flex flex-col px-2 rounded-b-(--card-radius) gap-2">
                        <section className="flex flex-row flex-0 w-full justify-between items-start">
                            <div className="flex flex-col">
                                <span className="font-bold">{formattedDate}</span>
                                <span className="text-xs">{formattedTime}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className={`font-bold ${getScoreColor(analysis.overall_score)}`}>{analysis.overall_score.toFixed(0)}%</span>
                            </div>
                        </section>

                        <div className="flex flex-col flex-1 justify-center pb-2">
                            <section className="flex flex-row w-full justify-between items-center">
                                <Metric label="Head Pos." value={Number(analysis.head_position.toFixed(0))}></Metric>
                                <Metric label="Back Pos." value={Number(analysis.back_position.toFixed(0))}></Metric>
                                <Metric label="Arm Pos." value={Number(analysis.arm_flexion.toFixed(0))}></Metric>
                            </section>
                            <section className="flex flex-row w-full justify-between items-center">
                                <Metric label="Right Knee" value={Number(analysis.right_knee.toFixed(0))}></Metric>
                                <Metric label="Left Knee" value={Number(analysis.left_knee.toFixed(0))}></Metric>
                                <Metric label="Foot Stk." value={Number(analysis.foot_strike.toFixed(0))}></Metric>
                            </section>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}