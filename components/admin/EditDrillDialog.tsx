'use client'

// UI Imports
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

// icons
import { Edit } from "lucide-react";
import { useState } from "react";

// forms imports
import { type FullFormData, step1Schema, step2Schema, step3Schema, step3SchemaWithTemplate, step4SchemaEdit, step5schema } from "@/schemas/admin/drillFormSchemas";
import { z } from "zod";

// regular imports
import { type Drill } from "@/hooks/drills/use-drills"
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2TrainingParameters } from "./Step2TrainingParameters";
import { Step3Instructions } from "./Step3Instructions";
import { Step4VideoEdit } from "./Step4VideoEdit";
import { useUpdateDrill } from "@/hooks/drills/use-update-drill";
import { Step5Explanation } from "./Step5Explanation";

export function EditDrillDialog({ drill, onSuccess }: { drill: Drill, onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [updateDrillError, setUpdateDrillError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<FullFormData>>({});

    // Controls whether changes apply to the template (all assignments) or just this one
    const [updateScope, setUpdateScope] = useState<'template' | 'assignment'>('template');
    const isAssignmentOverride = updateScope === 'assignment';

    const { updateDrill, updateLoading, updateError } = useUpdateDrill();

    const hasTemplate = !!drill.template_id;
    const TOTAL_STEPS = 5;
    const stepSchemas = {
        1: step1Schema,
        2: step2Schema,
        3: hasTemplate ? step3SchemaWithTemplate : step3Schema,
        4: step4SchemaEdit,
        5: step5schema
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepDefaults: Record<number, any> = {
        1: {
            drill_name: drill.drill_name,
            area: drill.area,
            performance_level: drill.performance_level,
            template_id: drill.template_id ?? undefined,
        },
        2: {
            sets: drill.sets,
            reps: drill.reps,
            rep_type: drill.rep_type,
            frequency: drill.frequency,
            is_high_impact: drill.is_high_impact ?? false
        },
        3: {
            instructions: drill.instructions,
            instructions_override: drill.instructions_override ?? undefined,
            has_instructions_override: !!drill.instructions_override,
        },
        4: { video: undefined },
        5: {
            justification: drill.justification,
            reference: drill.reference,
            justification_override: drill.justification_override ?? undefined,
            has_justification_override: !!drill.justification_override,
        }
    }

    const currentSchema = stepSchemas[step as keyof typeof stepSchemas] as z.ZodTypeAny;
    const defaultValues = stepDefaults[step];

    const form = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onSubmit",
        defaultValues
    });

    async function onStepSubmit(values: z.infer<typeof currentSchema>) {
        const updatedData = { ...formData, ...values };
        setFormData(updatedData);

        if (step < TOTAL_STEPS) {
            const nextStep = step + 1;
            setFormData(updatedData);
            setStep(nextStep);
            form.reset({ ...stepDefaults[nextStep], ...updatedData });
            return;
        } else {
            // Build FormData payload
            const formPayload = new FormData();
            formPayload.append("update_scope", updateScope);

            Object.entries(updatedData).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                if (key === "instructions" || key === "instructions_override") {
                    formPayload.append(key, JSON.stringify(value));
                } else if (key === "has_instructions_override" || key === "has_justification_override") {
                    // Internal toggle state — don't send to API
                    return;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formPayload.append(key, value as any);
                }
            });

            try {
                await updateDrill(formPayload, drill.id);
                onSuccess?.();
                setIsOpen(false);
                setStep(1);
                setFormData({});
                form.reset();
                setUpdateDrillError(null);
            } catch (error) {
                setUpdateDrillError(error instanceof Error ? error.message : String(error));
                console.error(error);
            }
        }
    }

    function prevStep() {
        setStep((prev) => prev - 1);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex flex-row items-center justify-center w-fit">
                    <Edit />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onStepSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Update Drill</DialogTitle>
                            <DialogDescription>Update an existing drill (Step {step} of {TOTAL_STEPS})</DialogDescription>
                        </DialogHeader>

                        {/* Scope selector — shown only when the drill has a linked template */}
                        {hasTemplate && (
                            <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>
                                        This drill is linked to a shared template.
                                        Changes to name, video, instructions, and justification default to updating the{" "}
                                        <strong>template</strong>, which affects all other assignments of this drill.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="assignment-override-checkbox"
                                        checked={isAssignmentOverride}
                                        onCheckedChange={(checked) =>
                                            setUpdateScope(checked === true ? 'assignment' : 'template')
                                        }
                                    />
                                    <Label htmlFor="assignment-override-checkbox" className="text-sm cursor-pointer">
                                        Override for this assignment only (leave template unchanged)
                                    </Label>
                                </div>
                                {isAssignmentOverride && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-6">
                                        Changes to instructions and justification will only apply to this assignment.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Show local updateDrillError */}
                        {updateDrillError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {updateDrillError}
                            </div>
                        )}

                        {/* Show hook error if any */}
                        {updateError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {updateError}
                            </div>
                        )}

                        {step === 1 && (
                            <Step1BasicInfo
                                isEditMode={true}
                                initialTemplate={drill.template_id ? { id: Number(drill.template_id), name: drill.template_name || drill.drill_name || "" } : null}
                            />
                        )}
                        {step === 2 && <Step2TrainingParameters />}
                        {step === 3 && (
                            <Step3Instructions
                                hasTemplate={hasTemplate}
                                templateInstructions={drill.instructions}
                            />
                        )}
                        {step === 4 && <Step4VideoEdit video_url={drill.video_url} thumbnail_url={drill.thumbnail_url} />}
                        {step === 5 && (
                            <Step5Explanation
                                hasTemplate={hasTemplate}
                                templateJustification={drill.justification}
                                templateReference={drill.reference}
                            />
                        )}

                        {updateError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {updateError}
                            </div>
                        )}

                        <DialogFooter className="flex flex-row items-center">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    Back
                                </Button>
                            )}

                            {step < TOTAL_STEPS ? (
                                <Button type="submit">Next</Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={updateLoading}
                                >
                                    {updateLoading ? 'Updating drill...' : 'Update drill'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}