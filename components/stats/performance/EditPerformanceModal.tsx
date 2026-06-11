import { useState, useEffect } from "react";
import { PerformanceSnapshot } from "@/lib/stats/types";
import { useEditPerformance } from "@/hooks/stats/use-performance";
import { toLocalDatetimeString } from "@/lib/stats/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit3, Loader2 } from "lucide-react";

interface EditPerformanceModalProps {
  snapshot: PerformanceSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPerformanceModal({ snapshot, isOpen, onClose }: EditPerformanceModalProps) {
  const { mutateAsync: editPerformance, isPending } = useEditPerformance();

  const [formData, setFormData] = useState({
    time_3k: "",
    time_5k: "",
    time_10k: "",
    recorded_at: "",
    notes: "",
  });

  const [showDiff, setShowDiff] = useState(false);
  const timeRegex = /^\d{1,2}:\d{2}$/;

  useEffect(() => {
    if (snapshot) {
      setFormData({
        time_3k: snapshot.time_3k || "",
        time_5k: snapshot.time_5k || "",
        time_10k: snapshot.time_10k || "",
        recorded_at: toLocalDatetimeString(snapshot.recorded_at),
        notes: snapshot.notes || "",
      });
      setShowDiff(false);
    }
  }, [snapshot, isOpen]);

  if (!snapshot) return null;

  const validateTimes = () => {
    if (!formData.time_3k && !formData.time_5k && !formData.time_10k) {
      toast.error("Please log at least one run time.");
      return false;
    }

    if (formData.time_3k && !timeRegex.test(formData.time_3k)) {
      toast.error("3K Time must be in MM:SS format (e.g., 12:30).");
      return false;
    }
    if (formData.time_5k && !timeRegex.test(formData.time_5k)) {
      toast.error("5K Time must be in MM:SS format (e.g., 20:45).");
      return false;
    }
    if (formData.time_10k && !timeRegex.test(formData.time_10k)) {
      toast.error("10K Time must be in MM:SS format (e.g., 42:10).");
      return false;
    }

    return true;
  };

  // Compute diffs
  const diffs: Array<{ label: string; from: string; to: string }> = [];

  const old3k = snapshot.time_3k || "";
  const new3k = formData.time_3k;
  if (old3k !== new3k) {
    diffs.push({ label: "3K Time", from: old3k || "None", to: new3k || "None" });
  }

  const old5k = snapshot.time_5k || "";
  const new5k = formData.time_5k;
  if (old5k !== new5k) {
    diffs.push({ label: "5K Time", from: old5k || "None", to: new5k || "None" });
  }

  const old10k = snapshot.time_10k || "";
  const new10k = formData.time_10k;
  if (old10k !== new10k) {
    diffs.push({ label: "10K Time", from: old10k || "None", to: new10k || "None" });
  }

  const oldNotes = snapshot.notes || "";
  const newNotes = formData.notes;
  if (oldNotes !== newNotes) {
    diffs.push({ label: "Notes", from: oldNotes || "None", to: newNotes || "None" });
  }

  const oldDate = toLocalDatetimeString(snapshot.recorded_at);
  const newDate = formData.recorded_at;
  if (oldDate !== newDate) {
    diffs.push({
      label: "Date",
      from: new Date(snapshot.recorded_at).toLocaleString(),
      to: new Date(formData.recorded_at).toLocaleString(),
    });
  }

  const handleSave = async () => {
    try {
      await editPerformance({
        id: snapshot.id,
        payload: {
          time_3k: formData.time_3k || undefined,
          time_5k: formData.time_5k || undefined,
          time_10k: formData.time_10k || undefined,
          notes: formData.notes,
          recorded_at: new Date(formData.recorded_at).toISOString(),
        },
      });
      toast.success("Performance entry updated successfully!");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update entry.");
    }
  };

  const hasChanges = diffs.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-indigo-600" /> Edit Performance Entry
          </DialogTitle>
          <DialogDescription>Update run time records for this history point.</DialogDescription>
        </DialogHeader>

        {!showDiff ? (
          <div className="space-y-4 my-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-time_3k">3K Time</Label>
                <Input
                  id="edit-time_3k"
                  placeholder="MM:SS"
                  value={formData.time_3k}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time_3k: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-time_5k">5K Time</Label>
                <Input
                  id="edit-time_5k"
                  placeholder="MM:SS"
                  value={formData.time_5k}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time_5k: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-time_10k">10K Time</Label>
                <Input
                  id="edit-time_10k"
                  placeholder="MM:SS"
                  value={formData.time_10k}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time_10k: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-perf-recorded_at">Date & Time</Label>
              <Input
                id="edit-perf-recorded_at"
                type="datetime-local"
                value={formData.recorded_at}
                onChange={(e) => setFormData((prev) => ({ ...prev, recorded_at: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-perf-notes">Notes</Label>
              <Textarea
                id="edit-perf-notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={!hasChanges}
                onClick={() => validateTimes() && setShowDiff(true)}
              >
                Review Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Before / After Diff</div>
              {diffs.map((diff, index) => (
                <div key={index} className="flex justify-between items-center text-sm gap-4 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-700">{diff.label}</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="line-through text-slate-400 max-w-[100px] truncate">{diff.from}</span>
                    <span>→</span>
                    <span className="font-bold text-slate-900 max-w-[120px] truncate">{diff.to}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDiff(false)} disabled={isPending}>
                Back
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
