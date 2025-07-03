'use client';

import { LatestAnalysis } from "@/components/register/dashboard/home/LatestAnalysis";
import { NoAnalysis } from "@/components/register/dashboard/home/NoAnalysis";
import { useHistory } from "@/hooks/useHIstory";
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
import { ChartAreaDefault } from "@/components/home/chart-area-default"
import { RecommendedDrill } from "@/components/home/recommended-drill";
import { SmartTip } from "@/components/home/smart-tip";
import { useEffect, useRef } from "react";

export default function HomePage() {

    const { history, isLoading, error, fetchHistory, getLatestAnalysis } = useHistory();
    const latestAnalysis = getLatestAnalysis();

    console.log('latest analysis: ', latestAnalysis)

    // fetch history when component mounts
    // useEffect(() => {
    //     fetchHistory();
    // },[]);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
    if (!hasFetchedRef.current && history.length === 0 && !isLoading) {
        fetchHistory();
        hasFetchedRef.current = true;
    }
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold">Home</h1>
                <p>Welcome to the home page!</p>
            </div>

            <section className="flex flex-row gap-4">
                <div className="w-1/3">
                    { isLoading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center">
                                <p>Loading...</p>
                            </CardContent>
                        </Card>                        
                    ) : error ? (
                        <Card>
                            <CardContent className="flex items-center justify-center">
                                <p>Error loading latest analysis.</p>
                            </CardContent>
                        </Card>
                    ) : latestAnalysis != null? (
                        <LatestAnalysis analysis={ latestAnalysis }/>
                    ) : ( 
                        <NoAnalysis /> 
                    )}
                </div>
                <RecommendedDrill></RecommendedDrill>
            </section>

            <section className="flex flex-row w-full justify-center items-center bg-red-200">
                <SmartTip />
            </section>
            
            <section>
                <ChartAreaDefault></ChartAreaDefault>
            </section>
        </div>
    );
}