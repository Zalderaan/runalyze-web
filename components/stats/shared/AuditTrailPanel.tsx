import { AuditEntry } from "@/lib/stats/types";
import { secondsToMMSS } from "@/lib/stats/formatters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar, History } from "lucide-react";

interface AuditTrailPanelProps {
  auditLogs: AuditEntry[];
  isLoading: boolean;
}

export function AuditTrailPanel({ auditLogs, isLoading }: AuditTrailPanelProps) {
  if (isLoading) {
    return <div className="text-center py-4 text-sm text-slate-500">Loading audit history...</div>;
  }

  if (!auditLogs || auditLogs.length === 0) {
    return <div className="text-center py-4 text-sm text-slate-500">No edits recorded for this entry.</div>;
  }

  const formatKeyName = (key: string) => {
    switch (key) {
      case "weight_kg": return "Weight";
      case "height_cm": return "Height";
      case "bmi": return "BMI";
      case "time_3k_secs": return "3K Time";
      case "time_5k_secs": return "5K Time";
      case "time_10k_secs": return "10K Time";
      case "notes": return "Notes";
      default: return key;
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (key: string, val: any) => {
    if (val === null || val === undefined) return "None";
    if (key.endsWith("_secs")) return secondsToMMSS(val);
    return val.toString();
  };

  const getActionBadgeColor = (action: AuditEntry["action"]) => {
    switch (action) {
      case "created": return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50";
      case "edited": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50";
      case "deleted": return "bg-red-50 text-red-700 border-red-200 hover:bg-red-50";
      case "restored": return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50";
      default: return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <History className="h-4 w-4 text-slate-500" />
        Change History
      </div>
      <Accordion type="single" collapsible className="w-full">
        {auditLogs.map((log) => {
          const formattedDate = new Date(log.performed_at).toLocaleString();
          const changedKeys = log.changed_fields ? Object.keys(log.changed_fields) : [];

          return (
            <AccordionItem key={log.id} value={`log-${log.id}`}>
              <AccordionTrigger className="hover:no-underline py-3 px-2">
                <div className="flex flex-wrap items-center gap-2 text-left w-full mr-2">
                  <Badge variant="outline" className={getActionBadgeColor(log.action)}>
                    {log.action.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-50 border border-slate-100 rounded-md p-3 mx-2 my-1">
                {log.action === "created" ? (
                  <div className="text-xs text-slate-600">Entry logged initially.</div>
                ) : changedKeys.length === 0 ? (
                  <div className="text-xs text-slate-600">No field values changed.</div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Changes:</div>
                    <div className="grid grid-cols-1 gap-2">
                      {changedKeys.map((key) => {
                        const change = log.changed_fields?.[key];
                        if (!change) return null;
                        return (
                          <div key={key} className="flex justify-between text-xs items-center gap-4 bg-white p-2 rounded border border-slate-100">
                            <span className="font-medium text-slate-700">{formatKeyName(key)}</span>
                            <div className="flex items-center gap-2 text-slate-600">
                              <span className="line-through text-slate-400">{formatValue(key, change.from)}</span>
                              <span>→</span>
                              <span className="font-semibold text-slate-800">{formatValue(key, change.to)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
