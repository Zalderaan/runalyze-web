'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Loader2, Pencil } from "lucide-react"

interface ResultsProps {
    download_url: string
    analysis_summary?: {
        overall_score: number
        head_position: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
        back_position: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
        arm_flexion: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
        right_knee: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
        left_knee: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
        foot_strike: {
            median_score: number
            average_score: number
            min_score: number
            max_score: number
        }
    }
    analysisName?: string
    setAnalysisName?: (name: string) => void
    onSaveName?: () => Promise<void> | void
    isSavingName?: boolean
    fatigueLevel?: number | null
    onSaveFatigue?: (level: number) => Promise<void> | void
    isSavingFatigue?: boolean
}

function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
}

function getScoreBgColor(score: number) {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
}

function ScoreBar({ score }: { score: number }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${score}%` }}
            />
        </div>
    )
}

function MetricCard({ label, score }: { label: string; score: number }) {
    const roundedScore = Math.round(score)
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-2xl font-bold ${getScoreColor(roundedScore)}`}>
                    {roundedScore}%
                </span>
            </div>
            <ScoreBar score={roundedScore} />
        </div>
    )
}

export function Results({ 
    download_url, 
    analysis_summary, 
    analysisName, 
    setAnalysisName, 
    onSaveName, 
    isSavingName,
    fatigueLevel = null,
    onSaveFatigue,
    isSavingFatigue
}: ResultsProps) {
    const overallScore = Math.round(analysis_summary?.overall_score ?? 0)
    const [isEditingName, setIsEditingName] = useState(false)

    const exportToCSV = () => {
        if (!analysis_summary) return;

        const headers = ["Metric", "Median Score (%)", "Average Score (%)", "Min Score (%)", "Max Score (%)"];
        const rows = [
            ["Overall Score", overallScore, "", "", ""],
            ["Head Position", Math.round(analysis_summary.head_position.median_score), Math.round(analysis_summary.head_position.average_score), Math.round(analysis_summary.head_position.min_score), Math.round(analysis_summary.head_position.max_score)],
            ["Back Position", Math.round(analysis_summary.back_position.median_score), Math.round(analysis_summary.back_position.average_score), Math.round(analysis_summary.back_position.min_score), Math.round(analysis_summary.back_position.max_score)],
            ["Arm Flexion", Math.round(analysis_summary.arm_flexion.median_score), Math.round(analysis_summary.arm_flexion.average_score), Math.round(analysis_summary.arm_flexion.min_score), Math.round(analysis_summary.arm_flexion.max_score)],
            ["Right Knee", Math.round(analysis_summary.right_knee.median_score), Math.round(analysis_summary.right_knee.average_score), Math.round(analysis_summary.right_knee.min_score), Math.round(analysis_summary.right_knee.max_score)],
            ["Left Knee", Math.round(analysis_summary.left_knee.median_score), Math.round(analysis_summary.left_knee.average_score), Math.round(analysis_summary.left_knee.min_score), Math.round(analysis_summary.left_knee.max_score)],
            ["Foot Strike", Math.round(analysis_summary.foot_strike.median_score), Math.round(analysis_summary.foot_strike.average_score), Math.round(analysis_summary.foot_strike.min_score), Math.round(analysis_summary.foot_strike.max_score)],
        ];

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `running_analysis_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-3 sm:p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 mb-4">
                    {isEditingName && setAnalysisName && onSaveName ? (
                        <div className="flex items-center gap-2 w-full sm:max-w-md">
                            <Input 
                                value={analysisName || ""}
                                onChange={(e) => setAnalysisName(e.target.value)}
                                className="font-bold border-blue-300 bg-white"
                                placeholder="Name your analysis..."
                                autoFocus
                            />
                            <Button 
                                onClick={async () => {
                                    await onSaveName();
                                    setIsEditingName(false);
                                }} 
                                disabled={isSavingName} className="shrink-0 gap-2"
                            >
                                {isSavingName && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </div>
                    ) : (
                        <div 
                            className="flex items-center gap-2 group cursor-pointer w-fit"
                            onClick={() => {
                                if (setAnalysisName && onSaveName) {
                                    setIsEditingName(true);
                                }
                            }}
                        >
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                {analysisName || "Running Form Analysis"}
                            </h2>
                            {setAnalysisName && onSaveName && (
                                <Pencil className="h-4 w-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    )}
                    <Button onClick={exportToCSV} variant="outline" className="gap-2 shrink-0">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>

                <div className="bg-white rounded-lg p-2 sm:p-4 mb-4 sm:mb-6 shadow-sm">
                    <video
                        src={download_url}
                        controls
                        className="w-full rounded-lg shadow-md aspect-video"
                    />
                </div>

                <div className={`${getScoreBgColor(overallScore)} rounded-lg p-6 mb-6`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">Overall Score</h3>
                        <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                        </span>
                    </div>
                    <ScoreBar score={overallScore} />
                </div>

                {onSaveFatigue && (
                    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-blue-100 relative">
                        {isSavingFatigue && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10 backdrop-blur-[1px]">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center sm:text-left">
                            How were you feeling during this run?
                        </h3>
                        <div className="flex justify-between items-center gap-2">
                            {[
                                { level: 1, label: "Fresh", emoji: "🔋" },
                                { level: 2, label: "Good", emoji: "🙂" },
                                { level: 3, label: "Normal", emoji: "😐" },
                                { level: 4, label: "Tired", emoji: "😮‍💨" },
                                { level: 5, label: "Exhausted", emoji: "🪫" },
                            ].map(item => (
                                <button
                                    key={item.level}
                                    onClick={() => onSaveFatigue(item.level)}
                                    disabled={isSavingFatigue}
                                    className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border-2 transition-all duration-200 ${
                                        fatigueLevel === item.level 
                                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105 grayscale-0' 
                                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200 grayscale hover:grayscale-0'
                                    } ${fatigueLevel !== null && fatigueLevel !== item.level ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    <span className="text-2xl mb-1">{item.emoji}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                                        fatigueLevel === item.level ? 'text-blue-700' : 'text-gray-500'
                                    }`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Form Breakdown</h3>
                    <MetricCard
                        label="Head Position"
                        score={analysis_summary?.head_position.median_score ?? 0}
                    />
                    <MetricCard
                        label="Back Position"
                        score={analysis_summary?.back_position.median_score ?? 0}
                    />
                    <MetricCard
                        label="Arm Flexion"
                        score={analysis_summary?.arm_flexion.median_score ?? 0}
                    />
                    <MetricCard
                        label="Right Knee"
                        score={analysis_summary?.right_knee.median_score ?? 0}
                    />
                    <MetricCard
                        label="Left Knee"
                        score={analysis_summary?.left_knee.median_score ?? 0}
                    />
                    <MetricCard
                        label="Foot Strike"
                        score={analysis_summary?.foot_strike.median_score ?? 0}
                    />
                </div>
            </div>
        </div>
    )
}