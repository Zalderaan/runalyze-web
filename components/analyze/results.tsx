'use client'

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

export function Results({ download_url, analysis_summary }: ResultsProps) {
    const overallScore = Math.round(analysis_summary?.overall_score ?? 0)
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Running Form Analysis</h2>
                
                <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                    <video 
                        src={download_url} 
                        controls 
                        className="w-full rounded-lg shadow-md"
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