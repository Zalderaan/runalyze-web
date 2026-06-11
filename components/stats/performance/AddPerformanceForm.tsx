import { useState } from "react";
import { useCreatePerformance } from "@/hooks/stats/use-performance";
import { toLocalDatetimeString } from "@/lib/stats/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trophy, Plus, Loader2 } from "lucide-react";

export function AddPerformanceForm() {
  const { mutateAsync: createPerformance, isPending } = useCreatePerformance();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    time_3k: "",
    time_5k: "",
    time_10k: "",
    recorded_at: toLocalDatetimeString(new Date()),
    notes: "",
  });

  const timeRegex = /^\d{1,2}:\d{2}$/;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTimes()) return;

    try {
      await createPerformance({
        time_3k: formData.time_3k || undefined,
        time_5k: formData.time_5k || undefined,
        time_10k: formData.time_10k || undefined,
        recorded_at: new Date(formData.recorded_at).toISOString(),
        notes: formData.notes || undefined,
      });

      toast.success("Performance logged successfully!");
      setFormData({
        time_3k: "",
        time_5k: "",
        time_10k: "",
        recorded_at: toLocalDatetimeString(new Date()),
        notes: "",
      });
      setIsOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to log performance.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      {!isOpen ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Log Best Times</h3>
              <p className="text-xs text-slate-500">Record run durations for 3K, 5K, and 10K runs</p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Log Durations
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-indigo-600" /> Log Performance Entry
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="time_3k">3K Time (MM:SS)</Label>
              <Input
                id="time_3k"
                placeholder="e.g., 12:30"
                value={formData.time_3k}
                onChange={(e) => setFormData((prev) => ({ ...prev, time_3k: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time_5k">5K Time (MM:SS)</Label>
              <Input
                id="time_5k"
                placeholder="e.g., 20:45"
                value={formData.time_5k}
                onChange={(e) => setFormData((prev) => ({ ...prev, time_5k: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time_10k">10K Time (MM:SS)</Label>
              <Input
                id="time_10k"
                placeholder="e.g., 42:15"
                value={formData.time_10k}
                onChange={(e) => setFormData((prev) => ({ ...prev, time_10k: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="perf_recorded_at">Date & Time</Label>
            <Input
              id="perf_recorded_at"
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, recorded_at: e.target.value }))}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="perf_notes">Notes (optional)</Label>
            <Textarea
              id="perf_notes"
              placeholder="E.g., felt great, race run, windy weather..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isPending}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging...
              </>
            ) : (
              "Save Performance"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
