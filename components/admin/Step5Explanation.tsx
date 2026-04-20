'use client'

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Step5ExplanationProps {
    /** Template's justification text (for read-only preview and seeding override) */
    templateJustification?: string | null;
    /** Template's reference (shown as read-only preview when template is selected) */
    templateReference?: string | null;
    /** Whether a template is currently selected */
    hasTemplate?: boolean;
}

export function Step5Explanation({
    templateJustification,
    templateReference,
    hasTemplate = false,
}: Step5ExplanationProps) {
    const { control, watch, setValue } = useFormContext();
    const hasOverride = watch("has_justification_override") ?? false;

    function handleOverrideToggle(checked: boolean) {
        setValue("has_justification_override", checked);
        if (checked && !watch("justification_override")) {
            // Seed override with template's justification
            setValue("justification_override", templateJustification ?? "");
        }
        if (!checked) {
            setValue("justification_override", undefined);
        }
    }

    return (
        <div className="space-y-4">
            {/* ---- When a template is selected ---- */}
            {hasTemplate && (
                <>
                    {/* Justification (with override toggle) */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <Label htmlFor="justification-override-toggle" className="text-sm text-muted-foreground flex-1">
                                {hasOverride
                                    ? "Overriding justification for this assignment only."
                                    : "Justification comes from the selected template."}
                            </Label>
                            <Switch
                                id="justification-override-toggle"
                                checked={hasOverride}
                                onCheckedChange={handleOverrideToggle}
                            />
                            <Label htmlFor="justification-override-toggle" className="text-sm font-medium">Override</Label>
                        </div>

                        {hasOverride ? (
                            <FormField
                                control={control}
                                name="justification_override"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Justification <span className="text-amber-600 text-xs">(Assignment Override)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Override justification for this specific assignment..."
                                                className="min-h-[100px]"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="p-3 rounded-md border bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Template Justification</p>
                                <p className="text-sm">
                                    {templateJustification ?? <span className="italic">No justification defined in this template.</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Reference: always from template (read-only) */}
                    <div className="p-3 rounded-md border bg-muted/20">
                        <p className="text-xs text-muted-foreground mb-1">Template Reference</p>
                        <p className="text-sm">
                            {templateReference ?? <span className="italic">No reference defined.</span>}
                        </p>
                    </div>
                </>
            )}

            {/* ---- When creating a new drill (no template) ---- */}
            {!hasTemplate && (
                <>
                    <FormField
                        control={control}
                        name="justification"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Explanation/Justification</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide a detailed explanation or justification for this drill..."
                                        className="min-h-[100px]"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Provide any references or sources..."
                                        className="min-h-[100px]"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
        </div>
    );
}