'use client'

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NoAnalysis() {
    const router = useRouter();

    const handleClickEmpty = () => {
        router.push('/dashboard/analyze');
    }
    return (
        <Card className="flex flex-col w-full h-2/3 border-2 border-dashed cursor-pointer">
            <CardContent
                className="flex flex-col h-full w-full justify-center items-center"
                onClick={handleClickEmpty}
            >
                <SquarePlus />
            </CardContent>
        </Card>
    );
}