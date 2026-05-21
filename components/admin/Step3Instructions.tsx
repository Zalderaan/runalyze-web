'use client'

import { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Step3InstructionsProps {
    /** Pass existing template instructions to show as read-only preview when a template is selected */
    templateInstructions?: { steps: string[] } | null;
    /** Whether a template is currently selected (controls override UI visibility) */
    hasTemplate?: boolean;
}

export function Step3Instructions({ templateInstructions, hasTemplate = false }: Step3InstructionsProps) {
    const { control, watch, setValue } = useFormContext();
    const hasOverride = watch("has_instructions_override") ?? false;

    console.log("[Step3Instructions LOG] props - hasTemplate:", hasTemplate, "templateInstructions:", templateInstructions);
    console.log("[Step3Instructions LOG] state - hasOverride:", hasOverride);

    // Main instructions field array (used for new drills)
    const mainFields = useFieldArray({ control, name: "instructions.steps" });
    // Override field array (used when overriding a template's instructions)
    const overrideFields = useFieldArray({ control, name: "instructions_override.steps" });

    console.log("[Step3Instructions LOG] mainFields count:", mainFields.fields.length, "overrideFields count:", overrideFields.fields.length);

    function handleOverrideToggle(checked: boolean) {
        setValue("has_instructions_override", checked);
        if (checked && overrideFields.fields.length === 0) {
            // Seed the override with the template's instructions as a starting point
            const seedSteps = templateInstructions?.steps ?? [""];
            seedSteps.forEach((step) => overrideFields.append(step));
        }
        if (!checked) {
            // Clear override on toggle off
            setValue("instructions_override", undefined);
        }
    }

    // -----------------------------------------------------------------------
    // When a template is selected but no override: show read-only preview
    // -----------------------------------------------------------------------
    if (hasTemplate && !hasOverride) {
        return (
            <div className="space-y-3">
                {/* Override toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Label htmlFor="instructions-override-toggle" className="text-sm text-muted-foreground flex-1">
                        Instructions come from the selected template. Toggle to override for this assignment only.
                    </Label>
                    <Switch
                        id="instructions-override-toggle"
                        checked={false}
                        onCheckedChange={handleOverrideToggle}
                    />
                    <Label htmlFor="instructions-override-toggle" className="text-sm font-medium">Override</Label>
                </div>

                {/* Read-only template preview */}
                {templateInstructions?.steps?.map((step, i) => (
                    <div key={i} className="p-3 rounded-md border bg-muted/20">
                        <p className="text-xs text-muted-foreground mb-1">Step {i + 1}</p>
                        <p className="text-sm">{step}</p>
                    </div>
                ))}
                {(!templateInstructions?.steps || templateInstructions.steps.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">No instructions defined in this template.</p>
                )}
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Override active: show editable override field array
    // -----------------------------------------------------------------------
    if (hasTemplate && hasOverride) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <Label htmlFor="instructions-override-toggle" className="text-sm text-amber-700 dark:text-amber-400 flex-1">
                        Overriding instructions for this assignment only. Template instructions are unchanged.
                    </Label>
                    <Switch
                        id="instructions-override-toggle"
                        checked={true}
                        onCheckedChange={handleOverrideToggle}
                    />
                    <Label htmlFor="instructions-override-toggle" className="text-sm font-medium text-amber-700 dark:text-amber-400">Override</Label>
                </div>

                {overrideFields.fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={control}
                        name={`instructions_override.steps.${index}`}
                        render={({ field }) => (
                            <FormItem className="mb-4">
                                <FormLabel>Step {index + 1}</FormLabel>
                                <div className="flex flex-row space-x-2">
                                    <FormControl>
                                        <Textarea
                                            placeholder={`Describe step ${index + 1} in detail`}
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="mt-1 h-full"
                                        onClick={() => overrideFields.remove(index)}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                ))}
                <Button type="button" variant="outline" onClick={() => overrideFields.append("")} className="w-full">
                    + Add Step
                </Button>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Default: No template — standard new drill instructions editing
    // -----------------------------------------------------------------------

    // Auto-seed one empty step on mount so the user sees a field immediately
    // instead of just a bare "+ Add Step" button with no visible validation guidance.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (hasTemplate) return;
        if (mainFields.fields.length === 0) {
            mainFields.append("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasTemplate]);

    return (
        <div className="space-y-2">
            {mainFields.fields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={control}
                    name={`instructions.steps.${index}`}
                    render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel>Step {index + 1}</FormLabel>
                            <FormDescription className="text-xs">Describe the instruction for this step.</FormDescription>
                            <div className="flex flex-row space-x-2">
                                <FormControl>
                                    <Textarea
                                        placeholder={`Describe step ${index + 1} in detail`}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="mt-1 h-full"
                                    onClick={() => mainFields.remove(index)}
                                >
                                    <Trash />
                                </Button>
                            </div>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
            ))}

            {/* Array-level error (e.g. "At least one instruction is required") */}
            <FormField
                control={control}
                name="instructions.steps"
                render={() => (
                    <FormItem>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <Button type="button" variant="outline" onClick={() => mainFields.append("")} className="w-full">
                + Add Step
            </Button>
        </div>
    );
}