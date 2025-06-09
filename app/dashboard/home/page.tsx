'use client';

import { LatestAnalysis } from "@/components/register/dashboard/home/LatestAnalysis";
import { NoAnalysis } from "@/components/register/dashboard/home/NoAnalysis";
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

export default function HomePage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col w-full">
                <h1 className="text-2xl font-bold">Home</h1>
                <p>Welcome to the home page!</p>
            </div>

            <section className="flex flex-row gap-4">
                <div className="w-1/3">
                    <LatestAnalysis /> {/* // TODO: conditional rendering (no video uploaded yet ? <EmptyCard> : <LatestAnalysis /> )   */}
                    {/* <NoAnalysis /> */}
                </div>
            </section>
        </div>
    );
}