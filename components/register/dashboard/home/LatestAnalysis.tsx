/**
 * get user details from context
 * if 
 */

'use client'

import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LatestAnalysisProps {
    title: string,
    total_score: number,
    head_pos: number,
    back_pos: number,
    arms_pos: number,
    front_knee: number,
    back_knee: number,
    foot_strike: number
}

export function LatestAnalysis() {
    return (
        <Card className="flex flex-col w-full h-full border-2 border-dashed cursor-pointer p-0 gap-0 rounded-(--card-radius) [--card-radius:var(--radius-xl)]">
            <CardHeader className="h-full w-full p-0 rounded-t-(--card-radius)">
                <Image
                    src='/run1.jpg'
                    alt='thumbnail'
                    width={200}
                    height={200}
                    className="rounded-t-(--card-radius) w-full h-full"
                />
            </CardHeader>
            <CardContent
                className="flex flex-col h-1/3 w-full justify-center items-center p-0 rounded-b-(--card-radius)"
            >
                {/* <SquarePlus /> */}
                <div className="w-full h-full flex flex-col px-2 rounded-b-(--card-radius) gap-2">
                    <section className="flex flex-row flex-0 w-full justify-between items-start">
                        <div className="flex flex-col">
                            <span className="font-bold">Latest Analysis</span>
                            <span className="text-xs">date</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs">Score</span>
                            <span className="font-bold">90%</span>
                        </div>
                    </section>

                    <div className="flex flex-col flex-1 justify-center pb-2">
                        <section className="flex flex-row w-full justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                        </section>
                        <section className="flex flex-row w-full justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs">Score</span>
                                <span className="font-bold">90%</span>
                            </div>
                        </section>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}