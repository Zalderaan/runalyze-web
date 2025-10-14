'use client'

import { useParams } from "next/navigation"
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Repeat, Target } from 'lucide-react'
import { useGetDrill } from "@/hooks/drills/use-get-drill";
import { DeleteDrillConfirmDialog } from "@/components/admin/DeleteDrillConfirmDialog";
import { EditDrillDialog } from "@/components/admin/EditDrillDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DrillDetails() {
    const [refreshKey, setRefreshKey] = useState(0);
    const params = useParams();
    const drill_id = params.id as string

    const { drill, drillLoading, drillError } = useGetDrill(drill_id, refreshKey);

    // console.log("This is drill: ", drill);

    if (drillLoading) return <div className="p-8">Loading drill...</div>
    if (drillError) return <div className="p-8 text-red-600">Error: {drillError}</div>
    if (!drill) return <div className="p-8">No drill found</div>


    // Format area name
    const formatArea = (area: string) => {
        return area.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Get performance level color
    const getPerformanceColor = (level: string) => {
        switch (level) {
            case 'Needs Improvement': return 'text-red-600 bg-red-50';
            case 'Satisfactory': return 'text-yellow-600 bg-yellow-50';
            case 'Excellent': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-2">
            {/* Go back button at the top left */}
            <div className="mb-4">
                <Button asChild variant="outline">
                    <Link href='/dashboard/drills/'>
                        <ArrowLeft className="mr-2" />
                        Go back
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            {drill.drill_name}
                        </CardTitle>
                        <CardDescription>
                            {formatArea(drill.area)}
                        </CardDescription>
                    </div>
                    <div className="flex flex-row items-center space-x-2">
                        {/* <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button> */}
                        <EditDrillDialog drill={drill} onSuccess={() => setRefreshKey((k) => k + 1)} />
                        <DeleteDrillConfirmDialog drill_id={drill_id} />
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Performance Level Badge */}
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(drill.performance_level)}`}>
                            <Target className="h-4 w-4 mr-2" />
                            {drill.performance_level}
                        </span>
                    </div>

                    {/* Video */}
                    {drill.video_url && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Video Demo</h3>
                            <video
                                controls
                                className="w-full rounded-lg border"
                                src={drill.video_url}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {/* Sets, Reps, Duration */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <Repeat className="h-5 w-5 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">Sets</p>
                                <p className="text-lg font-semibold">{drill.sets}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <Repeat className="h-5 w-5 text-gray-600" />
                            <div>
                                <p className="text-xs text-gray-500">Reps</p>
                                <p className="text-lg font-semibold">{drill.reps} {drill.rep_type}</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                        <ol className="flex flex-col space-y-2 text-gray-700 leading-relaxed">
                            {drill.instructions.steps.map(
                                (step, idx) => (
                                    <li className="pl-2 py-2 bg-white rounded shadow-sm border border-gray-100 flex items-start" key={idx}>
                                        <span className="font-medium text-blue-600 mr-2">{idx + 1}.</span>
                                        <span className="text-gray-700">{step}</span>
                                    </li>
                                )
                            )
                            }
                        </ol>
                    </div>

                    {/* Frequency */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">Frequency:</span>
                        <span>{drill.frequency}x per week</span>
                    </div>
                </CardContent>

                <CardFooter className="text-xs text-gray-500 border-t pt-4">
                    Created: {new Date(drill.created_at).toLocaleDateString()} |
                    Last updated: {new Date(drill.updated_at).toLocaleDateString()}
                </CardFooter>
            </Card>
        </div>
    )
}