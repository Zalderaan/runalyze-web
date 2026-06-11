import { useState } from "react";
import { useGetPerformance } from "@/hooks/stats/use-performance";
import { PerformanceSnapshot } from "@/lib/stats/types";
import { TimelineFilters, TimeRange } from "@/components/stats/shared/TimelineFilters";
import { PerformanceEntry } from "./PerformanceEntry";
import { EditPerformanceModal } from "./EditPerformanceModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trophy } from "lucide-react";

export function PerformanceTimeline() {
  const [range, setRange] = useState<TimeRange>("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<PerformanceSnapshot | null>(null);

  const { data: snapshots, isLoading } = useGetPerformance(showDeleted);

  const filterByRange = (items: PerformanceSnapshot[]) => {
    if (range === "all") return items;
    const days = Number(range);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return items.filter((item) => new Date(item.recorded_at) >= cutoffDate);
  };

  const filteredSnapshots = snapshots ? filterByRange(snapshots) : [];

  return (
    <div className="space-y-4">
      <TimelineFilters
        range={range}
        onRangeChange={setRange}
        showDeleted={showDeleted}
        onShowDeletedChange={setShowDeleted}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mr-2" />
          Loading performance history...
        </div>
      ) : filteredSnapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-slate-100/80 rounded-xl">
          <Trophy className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-medium">No performance entries found</p>
          <p className="text-xs text-slate-400 mt-1">Try changing the timeframe or add a new run record above.</p>
        </div>
      ) : (
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-3">
            {filteredSnapshots.map((snapshot) => (
              <PerformanceEntry
                key={snapshot.id}
                entry={snapshot}
                onEdit={setEditingSnapshot}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      <EditPerformanceModal
        snapshot={editingSnapshot}
        isOpen={editingSnapshot !== null}
        onClose={() => setEditingSnapshot(null)}
      />
    </div>
  );
}
