'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface PlatformInsightsProps {
    drills: { area?: string }[];
    applicationCounts: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

export function PlatformInsights({ drills, applicationCounts }: PlatformInsightsProps) {
    // Group drills by area
    const formatLabel = (label: string) => {
        // Map common snake_case or specific strings to pretty labels
        if (!label) return 'Other';
        return label
            .split(/[ _]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Group drills by area
    const drillsByArea = drills.reduce((acc: Record<string, number>, drill: { area?: string }) => {
        const rawArea = drill.area || 'Other';
        const formattedArea = formatLabel(rawArea);
        acc[formattedArea] = (acc[formattedArea] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const areaData = Object.entries(drillsByArea).map(([name, value]) => ({ name, value }));

    const appStatusData = [
        { name: 'Pending', value: applicationCounts.pending, color: '#f59e0b' },
        { name: 'Approved', value: applicationCounts.approved, color: '#10b981' },
        { name: 'Rejected', value: applicationCounts.rejected, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-xl">Drills by Focus Area</CardTitle>
                    <CardDescription>Distribution of active drills across different anatomical areas</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={areaData} margin={{ bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 10 }}
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255,255,255,0.8)', 
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {areaData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.6 + (index % 4) * 0.1})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-xl">Application Status</CardTitle>
                    <CardDescription>Overview of recent coaching applications</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    {appStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={appStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {appStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ 
                                        backgroundColor: 'rgba(255,255,255,0.8)', 
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No application data available</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
