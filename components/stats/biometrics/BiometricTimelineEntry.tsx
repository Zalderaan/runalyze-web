import { useState } from "react";
import { BiometricSnapshot } from "@/lib/stats/types";
import { useGetBiometricAudit, useDeleteBiometric, useEditBiometric } from "@/hooks/stats/use-biometrics";
import { formatBMI } from "@/lib/stats/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailPanel } from "@/components/stats/shared/AuditTrailPanel";
import { DeleteConfirmDialog } from "@/components/stats/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import { Edit3, Trash2, Calendar, FileText, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

interface BiometricTimelineEntryProps {
  entry: BiometricSnapshot;
  onEdit: (entry: BiometricSnapshot) => void;
}

export function BiometricTimelineEntry({ entry, onEdit }: BiometricTimelineEntryProps) {
  const [showAudit, setShowAudit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: auditLogs, isLoading: isLoadingAudit } = useGetBiometricAudit(entry.id, showAudit);
  const { mutateAsync: deleteBiometric, isPending: isDeleting } = useDeleteBiometric();
  const { mutateAsync: editBiometric, isPending: isRestoring } = useEditBiometric();

  const handleDelete = async () => {
    try {
      await deleteBiometric(entry.id);
      toast.success("Entry deleted successfully.");
      setShowDeleteConfirm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete entry.");
    }
  };

  const handleRestore = async () => {
    try {
      await editBiometric({
        id: entry.id,
        payload: { is_deleted: false },
      });
      toast.success("Entry restored successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to restore entry.");
    }
  };

  const formattedDate = new Date(entry.recorded_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className={`overflow-hidden border-slate-100/80 shadow-sm transition-all duration-200 ${
      entry.is_deleted ? "opacity-60 bg-slate-50 border-dashed" : "hover:border-slate-200 hover:shadow"
    }`}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header / Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2">
            {entry.is_deleted ? (
              <>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
                  DELETED
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-800"
                  onClick={() => onEdit(entry)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Columns */}
        <div className={`grid grid-cols-3 gap-2 sm:gap-4 text-center ${entry.is_deleted ? "line-through text-slate-400" : ""}`}>
          <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1">
              {entry.weight_kg ? `${entry.weight_kg} kg` : "—"}
            </div>
          </div>
          <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Height</div>
            <div className="text-sm sm:text-base font-bold text-slate-800 mt-1">
              {entry.height_cm ? `${entry.height_cm} cm` : "—"}
            </div>
          </div>
          <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">BMI</div>
            <div className="text-sm sm:text-base font-bold text-emerald-600 mt-1">
              {formatBMI(entry.bmi)}
            </div>
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="flex gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50/30 p-3 rounded-lg border border-slate-100/30">
            <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className={entry.is_deleted ? "line-through text-slate-400" : ""}>{entry.notes}</p>
          </div>
        )}

        {/* Audit Trail Toggle */}
        <div className="border-t border-slate-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAudit(!showAudit)}
            className="text-xs text-slate-500 hover:text-slate-700 h-7 p-0 flex items-center gap-1.5"
          >
            {showAudit ? (
              <>
                Hide Audit Trail
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show Audit Trail
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          {showAudit && (
            <div className="mt-4 pt-3 border-t border-slate-100/50">
              <AuditTrailPanel auditLogs={auditLogs || []} isLoading={isLoadingAudit} />
            </div>
          )}
        </div>
      </CardContent>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isPending={isDeleting}
        title="Delete Biometrics Entry"
        description="Are you sure you want to delete this biometrics entry? This will update your charts."
      />
    </Card>
  );
}
