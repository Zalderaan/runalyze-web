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

export function Results({ download_url, analysis_summary } : ResultsProps) {
    return (
        <div className="">
            <video src={download_url} controls width={400}></video>
            <div className="flex flex-col justify-center items-left space-y-1">
                <span>Overall Score: {Math.round(analysis_summary?.overall_score ?? 0)}%</span>
                <span>Head Position: {Math.round(analysis_summary?.head_position.median_score ?? 0)}%</span>
                <span>Back Position: {Math.round(analysis_summary?.back_position.median_score ?? 0)}%</span>
                <span>Arm Flexion: {Math.round(analysis_summary?.arm_flexion.median_score ?? 0)}%</span>
                <span>Right Knee: {Math.round(analysis_summary?.right_knee.median_score ?? 0)}%</span>
                <span>Left Knee: {Math.round(analysis_summary?.left_knee.median_score ?? 0)}%</span>
                <span>Foot Strike: {Math.round(analysis_summary?.foot_strike.median_score ?? 0)}%</span>
            </div>
        </div>
    )
}