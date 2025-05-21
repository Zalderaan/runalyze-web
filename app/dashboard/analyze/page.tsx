'use client';

import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { SquarePlus } from 'lucide-react';

const handleUpload = () => {
    console.log('Uploading...')
}

export default function AnalyzePage() {
    return (
        <div className="flex flex-col justify-start items-center h-full w-full gap-4 py-12">
            <h1 className="text-4xl font-bold">Analyze Running Form</h1>
            <h3 className="text-xl">Get insights on your running form</h3>
            <Card className="flex flex-col border-2 border-dashed cursor-pointer">
            {/**
             *  // TODO: conditional rendering (video uploaded ? show SquarePlus : show uploaded filename)  
             * */}
                <CardContent
                    className="flex flex-col h-full w-full justify-center items-center" 
                    onClick={handleUpload}
                >
                    <SquarePlus />
                </CardContent>
            </Card>
            <span className="text-xs">Upload running footage here (6-10s)</span>
        </div>
    );
}