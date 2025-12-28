// 'use client'

// import { RoleGuard } from "@/components/RoleGuard"
// import { useHistory } from "@/hooks/use-history"
// import {
//     Select,
//     SelectContent,
//     SelectGroup,
//     SelectItem,
//     SelectLabel,
//     SelectScrollDownButton,
//     SelectScrollUpButton,
//     SelectSeparator,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// export default function ComparePage() {
//     // TODO: get user sessions
//     // TODO: UI for two pickers (sessions)

//     const { history, isLoading, error } = useHistory();
//     console.table(history);

//     return (
//         <RoleGuard allowedRoles={['user']}>
//             <Select>
//                 <SelectTrigger>
//                     Pick the first run
//                 </SelectTrigger>
//                 <SelectContent>
//                     {
//                         history.map((i) => (
//                             <SelectItem value={String(i.id)}>Analysis {i.id}</SelectItem>
//                         ))
//                     }
//                 </SelectContent>
//             </Select>
//             <p>ComparePage()</p>

//         </RoleGuard>
//     )
// }


'use client'

import { RoleGuard } from "@/components/RoleGuard"
import { useHistory, HistoryItem } from "@/hooks/use-history"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
    GitCompare, 
    ArrowRight, 
    TrendingUp, 
    TrendingDown, 
    Minus,
    History,
    Loader2,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getScoreColor } from "@/components/home/RunAnalysis"
import { cn } from "@/lib/utils"

function CompareContent() {
    const searchParams = useSearchParams()
    const { history, isLoading, error, getAnalysisDetails } = useHistory()
    
    const firstId = searchParams.get('first')
    const secondId = searchParams.get('second')
    
    const [firstAnalysis, setFirstAnalysis] = useState<HistoryItem | null>(null)
    const [secondAnalysis, setSecondAnalysis] = useState<HistoryItem | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        async function loadAnalyses() {
            if (firstId && secondId) {
                setLoadingDetails(true)
                try {
                    const [first, second] = await Promise.all([
                        getAnalysisDetails(firstId),
                        getAnalysisDetails(secondId)
                    ])
                    setFirstAnalysis(first)
                    setSecondAnalysis(second)
                } finally {
                    setLoadingDetails(false)
                }
            }
        }
        loadAnalyses()
    }, [firstId, secondId, getAnalysisDetails])

    // Empty state - no analyses selected
    if (!firstId || !secondId) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-blue-100 rounded-full">
                            <GitCompare className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Compare Your Runs</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Select two analyses to compare your running form side by side and track your progress over time.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard/history">
                            <Button size="lg">
                                <History className="h-4 w-4 mr-2" />
                                Go to History to Compare
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Quick select if they have analyses */}
                    {history.length >= 2 && (
                        <div className="pt-8 border-t mt-8">
                            <h3 className="text-lg font-semibold mb-4">Or quick compare your latest runs</h3>
                            <Link href={`/dashboard/compare?first=${history[0]?.id}&second=${history[1]?.id}`}>
                                <Button variant="outline">
                                    Compare Latest Two Analyses
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )}
                    
                    {history.length < 2 && (
                        <Card className="bg-amber-50 border-amber-200 max-w-md mx-auto">
                            <CardContent className="py-4">
                                <p className="text-sm text-amber-800">
                                    You need at least 2 analyses to compare. 
                                    <Link href="/dashboard/analyze" className="underline ml-1">
                                        Analyze more videos
                                    </Link> to unlock comparison.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoading || loadingDetails) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <h3 className="text-lg font-semibold">Loading Comparison</h3>
                        <p className="text-muted-foreground">Fetching your analyses...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !firstAnalysis || !secondAnalysis) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error Loading Comparison</h3>
                                <p className="text-sm text-red-800 mt-1">
                                    {error || "Could not load one or both analyses. They may have been deleted."}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/dashboard/history">
                                <Button variant="outline">
                                    <History className="h-4 w-4 mr-2" />
                                    Back to History
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Helper to render difference indicator
    const renderDiff = (newVal: number, oldVal: number) => {
        const diff = newVal - oldVal
        if (Math.abs(diff) < 0.5) {
            return <Minus className="h-4 w-4 text-gray-400" />
        }
        if (diff > 0) {
            return (
                <span className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{diff.toFixed(1)}%
                </span>
            )
        }
        return (
            <span className="flex items-center text-red-600 text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                {diff.toFixed(1)}%
            </span>
        )
    }

    const metrics = [
        { label: "Overall Score", key: "overall_score" },
        { label: "Head Position", key: "head_position" },
        { label: "Back Position", key: "back_position" },
        { label: "Arm Flexion", key: "arm_flexion" },
        { label: "Right Knee", key: "right_knee" },
        { label: "Left Knee", key: "left_knee" },
        { label: "Foot Strike", key: "foot_strike" },
    ] as const

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <GitCompare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Compare Analyses</h1>
                        <p className="text-muted-foreground">Side by side comparison of your running form</p>
                    </div>
                </div>
                <Link href="/dashboard/history">
                    <Button variant="outline">
                        <History className="h-4 w-4 mr-2" />
                        Compare Different Runs
                    </Button>
                </Link>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[firstAnalysis, secondAnalysis].map((analysis, index) => (
                    <Card key={analysis.id} className={cn(
                        "relative",
                        index === 0 && "border-blue-200",
                        index === 1 && "border-green-200"
                    )}>
                        <div className="absolute top-2 left-2 z-10">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                                {index === 0 ? "Before" : "After"}
                            </Badge>
                        </div>
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            {analysis.videos?.[0].thumbnail_url ? (
                                <Image
                                    src={analysis.videos[0].thumbnail_url}
                                    alt={`Analysis ${analysis.id}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Analysis #{analysis.id}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(analysis.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                                {analysis.overall_score.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Metrics Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {metrics.map(({ label, key }) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                                <span className="font-medium">{label}</span>
                                <div className="flex items-center gap-8">
                                    <span className={cn(
                                        "w-20 text-right",
                                        getScoreColor(firstAnalysis[key])
                                    )}>
                                        {firstAnalysis[key].toFixed(1)}%
                                    </span>
                                    <div className="w-24 flex justify-center">
                                        {renderDiff(secondAnalysis[key], firstAnalysis[key])}
                                    </div>
                                    <span className={cn(
                                        "w-20 text-right",
                                        getScoreColor(secondAnalysis[key])
                                    )}>
                                        {secondAnalysis[key].toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className={cn(
                secondAnalysis.overall_score > firstAnalysis.overall_score 
                    ? "bg-green-50 border-green-200" 
                    : secondAnalysis.overall_score < firstAnalysis.overall_score
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50"
            )}>
                <CardContent className="py-6">
                    <div className="text-center">
                        {secondAnalysis.overall_score > firstAnalysis.overall_score ? (
                            <>
                                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h3 className="text-lg font-semibold text-green-900">Great Progress!</h3>
                                <p className="text-green-800">
                                    Your overall score improved by {(secondAnalysis.overall_score - firstAnalysis.overall_score).toFixed(1)}%
                                </p>
                            </>
                        ) : secondAnalysis.overall_score < firstAnalysis.overall_score ? (
                            <>
                                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <h3 className="text-lg font-semibold text-red-900">Room for Improvement</h3>
                                <p className="text-red-800">
                                    Your overall score decreased by {(firstAnalysis.overall_score - secondAnalysis.overall_score).toFixed(1)}%
                                </p>
                            </>
                        ) : (
                            <>
                                <Minus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                <h3 className="text-lg font-semibold">Consistent Performance</h3>
                                <p className="text-muted-foreground">Your scores are nearly identical</p>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ComparePage() {
    return (
        <RoleGuard allowedRoles={['user']}>
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            }>
                <CompareContent />
            </Suspense>
        </RoleGuard>
    )
}