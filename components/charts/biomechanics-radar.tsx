"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

interface JointScores {
    head_position: number;
    back_position: number;
    arm_flexion: number;
    right_knee: number;
    left_knee: number;
    foot_strike: number;
}

export function BiomechanicsRadar({ data }: { data: JointScores | null }) {
    if (!data) return null;

    const chartData = [
        { subject: 'Head', A: data.head_position, fullMark: 100 },
        { subject: 'Back', A: data.back_position, fullMark: 100 },
        { subject: 'Arms', A: data.arm_flexion, fullMark: 100 },
        { subject: 'Front Knee', A: data.right_knee, fullMark: 100 },
        { subject: 'Back Knee', A: data.left_knee, fullMark: 100 },
        { subject: 'Foot Strike', A: data.foot_strike, fullMark: 100 },
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
