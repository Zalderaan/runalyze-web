'use client';

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DrillFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    area: string;
    onAreaChange: (value: string) => void;
    performanceLevel: string;
    onPerformanceLevelChange: (value: string) => void;
}

export function DrillFilters({
    searchTerm,
    onSearchChange,
    area,
    onAreaChange,
    performanceLevel,
    onPerformanceLevelChange
}: DrillFiltersProps) {
    const areas = [
        { label: "All Areas", value: "All" },
        { label: "Head Position", value: "head_position" },
        { label: "Arm Flexion", value: "arm_flexion" },
        { label: "Back Position", value: "back_position" },
        { label: "Right Knee", value: "right_knee" },
        { label: "Left Knee", value: "left_knee" },
        { label: "Foot Strike", value: "foot_strike" }
    ];
    const levels = [
        { label: "All Levels", value: "All" },
        { label: "Good", value: "good" },
        { label: "Excellent", value: "excellent" },
        { label: "Needs Improvement", value: "needs_improvement" },
        { label: "Poor", value: "poor" }
    ];




    const clearFilters = () => {
        onSearchChange("");
        onAreaChange("All");
        onPerformanceLevelChange("All");
    };

    const hasActiveFilters = searchTerm !== "" || area !== "All" || performanceLevel !== "All";

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full md:flex-grow group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search drills by name..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-primary h-11"
                />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={area} onValueChange={onAreaChange}>
                    <SelectTrigger className="w-full md:w-[160px] bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl h-11">
                        <div className="flex items-center gap-2">
                            <SelectValue placeholder="Focus Area" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {areas.map(a => (
                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={performanceLevel} onValueChange={onPerformanceLevelChange}>
                    <SelectTrigger className="w-full md:w-[140px] bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl h-11">
                        <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                        {levels.map(l => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                    </SelectContent>

                </Select>

                {hasActiveFilters && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearFilters}
                        className="h-11 w-11 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
