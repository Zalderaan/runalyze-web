import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimeRange = "30" | "90" | "180" | "all";

interface TimelineFiltersProps {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  showDeleted: boolean;
  onShowDeletedChange: (showDeleted: boolean) => void;
}

export function TimelineFilters({
  range,
  onRangeChange,
  showDeleted,
  onShowDeletedChange,
}: TimelineFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <Label htmlFor="time-range" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Timeframe
        </Label>
        <Select value={range} onValueChange={(val) => onRangeChange(val as TimeRange)}>
          <SelectTrigger id="time-range" className="w-[140px] h-9 bg-white border-slate-200">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Past 30 Days</SelectItem>
            <SelectItem value="90">Past 90 Days</SelectItem>
            <SelectItem value="180">Past 6 Months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="show-deleted"
          checked={showDeleted}
          onCheckedChange={onShowDeletedChange}
        />
        <Label htmlFor="show-deleted" className="text-xs font-semibold text-slate-600 cursor-pointer">
          Show Deleted Entries
        </Label>
      </div>
    </div>
  );
}
