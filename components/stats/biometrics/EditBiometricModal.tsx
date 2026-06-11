import { useState, useEffect } from "react";
import { BiometricSnapshot } from "@/lib/stats/types";
import { useEditBiometric } from "@/hooks/stats/use-biometrics";
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

interface EditBiometricModalProps {
  snapshot: BiometricSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBiometricModal({ snapshot, isOpen, onClose }: EditBiometricModalProps) {
  const { mutateAsync: editBiometric, isPending } = useEditBiometric();

  const [formData, setFormData] = useState({
    height_cm: "",
    weight_kg: "",
    recorded_at: "",
    notes: "",
  });

  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (snapshot) {
      setFormData({
        height_cm: snapshot.height_cm?.toString() || "",
        weight_kg: snapshot.weight_kg?.toString() || "",
        recorded_at: toLocalDatetimeString(snapshot.recorded_at),
        notes: snapshot.notes || "",
      });
      setShowDiff(false);
    }
  }, [snapshot, isOpen]);

  if (!snapshot) return null;

  // Compute diffs
  const diffs: Array<{ label: string; from: string; to: string }> = [];

  const oldHeight = snapshot.height_cm || 0;
  const newHeight = formData.height_cm ? Number(formData.height_cm) : 0;
  if (oldHeight !== newHeight) {
    diffs.push({
      label: "Height",
      from: oldHeight ? `${oldHeight} cm` : "None",
      to: newHeight ? `${newHeight} cm` : "None",
    });
  }

  const oldWeight = snapshot.weight_kg || 0;
  const newWeight = formData.weight_kg ? Number(formData.weight_kg) : 0;
  if (oldWeight !== newWeight) {
    diffs.push({
      label: "Weight",
      from: oldWeight ? `${oldWeight} kg` : "None",
      to: newWeight ? `${newWeight} kg` : "None",
    });
  }

  const oldNotes = snapshot.notes || "";
  const newNotes = formData.notes;
  if (oldNotes !== newNotes) {
    diffs.push({
      label: "Notes",
      from: oldNotes || "None",
      to: newNotes || "None",
    });
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
      await editBiometric({
        id: snapshot.id,
        payload: {
          height_cm: formData.height_cm ? Number(formData.height_cm) : undefined,
          weight_kg: formData.weight_kg ? Number(formData.weight_kg) : undefined,
          notes: formData.notes,
          recorded_at: new Date(formData.recorded_at).toISOString(),
        },
      });
      toast.success("Entry updated successfully!");
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
            <Edit3 className="h-5 w-5 text-emerald-600" /> Edit Biometrics Entry
          </DialogTitle>
          <DialogDescription>Update the details of your logged body composition check-in.</DialogDescription>
        </DialogHeader>

        {!showDiff ? (
          <div className="space-y-4 my-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-height">Height (cm)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  step="0.1"
                  value={formData.height_cm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, height_cm: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-weight">Weight (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight_kg: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-recorded_at">Date & Time</Label>
              <Input
                id="edit-recorded_at"
                type="datetime-local"
                value={formData.recorded_at}
                onChange={(e) => setFormData((prev) => ({ ...prev, recorded_at: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
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
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={!hasChanges}
                onClick={() => setShowDiff(true)}
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
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isPending}>
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
