import { useState } from "react";
import { useCreateBiometric } from "@/hooks/stats/use-biometrics";
import { toLocalDatetimeString } from "@/lib/stats/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Activity, Plus, Loader2 } from "lucide-react";

export function AddBiometricForm() {
  const { mutateAsync: createBiometric, isPending } = useCreateBiometric();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    height_cm: "",
    weight_kg: "",
    recorded_at: toLocalDatetimeString(new Date()), // YYYY-MM-DDThh:mm local format
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.height_cm && !formData.weight_kg) {
      toast.error("Please enter height or weight.");
      return;
    }

    try {
      await createBiometric({
        height_cm: formData.height_cm ? Number(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
        recorded_at: new Date(formData.recorded_at).toISOString(),
        notes: formData.notes || undefined,
      });

      toast.success("Biometrics logged successfully!");
      setFormData({
        height_cm: "",
        weight_kg: "",
        recorded_at: toLocalDatetimeString(new Date()),
        notes: "",
      });
      setIsOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to log biometrics.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      {!isOpen ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Log Biometrics</h3>
              <p className="text-xs text-slate-500">Record weight, height, and track BMI progress</p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Log Entry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" /> Log Biometrics Entry
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="e.g., 175.5"
                value={formData.height_cm}
                onChange={(e) => setFormData((prev) => ({ ...prev, height_cm: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 68.2"
                value={formData.weight_kg}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight_kg: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="recorded_at">Date & Time</Label>
            <Input
              id="recorded_at"
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, recorded_at: e.target.value }))}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How are you feeling today?"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={isPending}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging...
              </>
            ) : (
              "Save Biometrics"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
