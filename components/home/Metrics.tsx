import { getScoreColor } from "@/components/home/RunAnalysis";

interface MetricProps {
    label: string;
    value: number;
    suffix?: string;
}

export function Metric({ label, value, suffix = '%' }: MetricProps) {
    return (
        <>
            <div className="flex flex-col">
                <span className="text-xs">{label}</span>
                <span className={`font-bold ${getScoreColor(value)}`}>{value}{suffix}</span>
            </div>
        </>
    );
}