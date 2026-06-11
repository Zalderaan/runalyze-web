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

interface CustomTickProps {
    cx?: number;
    cy?: number;
    x: number;
    y: number;
    radius?: number;
    index: number;
    payload: {
        value: string;
    };
}

export function BiomechanicsRadar({ data }: { data: JointScores | null }) {
    console.log("BiomechanicsRadar rendering with data:", data);
    if (!data) return null;

    const chartData = [
        { subject: 'Head', A: data.head_position, fullMark: 100 },
        { subject: 'Back', A: data.back_position, fullMark: 100 },
        { subject: 'Arms', A: data.arm_flexion, fullMark: 100 },
        { subject: 'Front Knee', A: data.right_knee, fullMark: 100 },
        { subject: 'Back Knee', A: data.left_knee, fullMark: 100 },
        { subject: 'Foot Strike', A: data.foot_strike, fullMark: 100 },
    ];

    function renderCustomAngleTick({ cx, cy, x, y, radius, index, payload }: CustomTickProps) {
        if (cx === undefined || cy === undefined || radius === undefined) return null;

        // Direction vector of the spoke
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;

        const ux = dx / dist;
        const uy = dy / dist;

        const ticks = [20, 40, 60, 80, 100];
        const offset = 11; // Increased offset to push tick numbers away from spoke lines
        const labelOffset = 14; // Push category labels outward to prevent overlap with the 100% tick

        const lx = x + labelOffset * ux;
        const ly = y + labelOffset * uy;

        return (
            <g pointerEvents="none">
                {/* Draw standard category name label (e.g., "Head") */}
                <text
                    x={lx}
                    y={ly - 7}
                    fill="#374151"
                    fontSize={11}
                    fontWeight="semibold"
                    textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
                    dominantBaseline="middle"
                >
                    {payload.value}
                </text>
                {/* Draw the percentage score directly below it */}
                <text
                    x={lx}
                    y={ly + 7}
                    fill="#3b82f6"
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
                    dominantBaseline="middle"
                >
                    {`${chartData[index].A}%`}
                </text>

                {/* Draw '0' tick at the center, only once */}
                {index === 0 && (
                    <text
                        x={cx}
                        y={cy + 8}
                        fill="#9ca3af"
                        fontSize={7.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        0
                    </text>
                )}

                {/* Draw scale ticks along this specific spoke */}
                {ticks.map((val) => {
                    const r = (val / 100) * radius;
                    // Offset calculation (perpendicular direction is -uy, ux)
                    const tx = cx + r * ux - offset * uy;
                    const ty = cy + r * uy + offset * ux;

                    return (
                        <text
                            key={val}
                            x={tx}
                            y={ty}
                            fill="#9ca3af"
                            fontSize={7.5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {val}
                        </text>
                    );
                })}
            </g>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={renderCustomAngleTick as any} />

                {/* Single radius axis to set the domain/ticks grid without drawing duplicate labels */}
                <PolarRadiusAxis
                    domain={[0, 100]}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ticks={[0, 20, 40, 60, 80, 100] as any}
                    tick={false}
                    axisLine={false}
                />

                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
