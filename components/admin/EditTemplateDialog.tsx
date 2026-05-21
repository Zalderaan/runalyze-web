'use client'

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
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type DrillTemplate } from "@/hooks/drills/use-drill-templates";
import { useUpdateDrillTemplate } from "@/hooks/drills/use-update-drill-template";

import { Step1BasicInfo } from "./Step1BasicInfo"; // We can reuse it, but we need a schema that only has name
import { Step3Instructions } from "./Step3Instructions";
import { Step4VideoEdit } from "./Step4VideoEdit";
import { Step5Explanation } from "./Step5Explanation";

// Minimal schemas just for templates
const step1TemplateSchema = z.object({
    drill_name: z.string().min(3, "Template name is required"),
});
import { step3Schema, step4SchemaEdit, step5schema } from "@/schemas/admin/drillFormSchemas";

export function EditTemplateDialog({ template, onSuccess }: { template: DrillTemplate, onSuccess?: (updatedTemplate?: DrillTemplate) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [fetchedTemplate, setFetchedTemplate] = useState<any | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    // Stable defaults keyed by step, rebuilt when fetchedTemplate changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stepDefaults, setStepDefaults] = useState<Record<number, any>>({
        1: { drill_name: template?.name },
        2: { instructions: undefined },
        3: { video: undefined },
        4: { justification: undefined, reference: undefined },
    });

    const { updateTemplate, updateLoading, updateError } = useUpdateDrillTemplate();

    const TOTAL_STEPS = 4;
    const stepSchemas = {
        1: step1TemplateSchema,
        2: step3Schema,
        3: step4SchemaEdit,
        4: step5schema
    };

    // getStepDefaults/getSourceTemplate replaced by `stepDefaults` state

    const currentSchema = stepSchemas[step as keyof typeof stepSchemas] as z.ZodTypeAny;
    const defaultValues = stepDefaults[step] ?? {};

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
            setStep(nextStep);
            form.reset({ ...(stepDefaults[nextStep] ?? {}), ...updatedData });
        } else {
            const formPayload = new FormData();

            Object.entries(updatedData).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                if (key === "drill_name") {
                    formPayload.append("name", value as string);
                } else if (key === "instructions") {
                    formPayload.append(key, JSON.stringify(value));
                } else {
                    formPayload.append(key, value as string | Blob);
                }
            });

            try {
                const result = await updateTemplate(formPayload, template.id);
                // API returns the updated template row as `template` or as the root object
                const updatedTemplate = result?.template ?? result;
                onSuccess?.(updatedTemplate);
                setIsOpen(false);
                setStep(1);
                setFormData({});
                form.reset();
            } catch (error) {
                console.error(error);
            }
        }
    }

    function prevStep() {
        const prev = step - 1;
        setStep(prev);
        form.reset({ ...(stepDefaults[prev] ?? {}), ...formData });
    }

    // Fetch full template details when dialog opens so we can populate training defaults
    // and other fields that may not be present on the lightweight `template` prop.
    // Reset the form when data arrives.

    async function fetchTemplateDetails(id: number | string) {
        try {
            const res = await fetch(`/api/admin/drill-templates/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data?.template ?? data;
        } catch (err) {
            console.error('Failed to fetch template details', err);
            return null;
        }
    }

    // When opening the dialog, fetch details. When closing, clear fetched data.
    // Also reset the form to the correct defaults when fetchedTemplate or step changes.

    useEffect(() => {
        let mounted = true;
        if (isOpen) {
            setIsFetchingDetails(true);
            fetchTemplateDetails(template.id).then((full) => {
                if (!mounted) return;
                if (full) setFetchedTemplate(full);
                setIsFetchingDetails(false);
            });
        } else {
            setFetchedTemplate(null);
            setStepDefaults({
                1: { drill_name: template?.name },
                2: { instructions: undefined },
                3: { video: undefined },
                4: { justification: undefined, reference: undefined },
            });
            form.reset();
        }
        return () => { mounted = false };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Rebuild stable `stepDefaults` when fetchedTemplate arrives and re-apply for current step
    useEffect(() => {
        if (!fetchedTemplate) return;

        const src = (() => {
            const s = { ...fetchedTemplate };
            if ((!s.sets && !s.reps && !s.rep_type && !s.frequency) && fetchedTemplate.sample_drill) {
                s.sets = fetchedTemplate.sample_drill.sets;
                s.reps = fetchedTemplate.sample_drill.reps;
                s.rep_type = fetchedTemplate.sample_drill.rep_type;
                s.frequency = fetchedTemplate.sample_drill.frequency;
                s.is_high_impact = fetchedTemplate.sample_drill.is_high_impact;
            }
            // Normalize performance_level to the canonical spaced form used by some schemas
            // UI components use `needs_improvement` (underscore); some Zod schemas expect
            // `needs improvement` (space). Convert underscore -> space here so defaults
            // match the schema expectations when the fetched template is applied to forms.
            if (s.performance_level === 'needs_improvement') {
                s.performance_level = 'needs improvement';
            }
            return s;
        })();

        const newDefaults = {
            1: { drill_name: src?.name },
            2: { instructions: src?.instructions },
            3: { video: undefined },
            4: { justification: src?.justification, reference: src?.reference },
        };

        setStepDefaults(newDefaults);
        // Re-apply defaults for the current step (merging any already-accumulated formData)
        form.reset({ ...(newDefaults[step as keyof typeof newDefaults] ?? {}), ...formData });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedTemplate]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onStepSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                            <DialogDescription>Update template details (Step {step} of {TOTAL_STEPS})</DialogDescription>
                        </DialogHeader>

                        {/* Error showing */}
                        {updateError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {updateError}
                            </div>
                        )}

                        {step === 1 && <Step1BasicInfo isTemplateMode={true} />}
                        {step === 2 && <Step3Instructions hasTemplate={false} />}
                        {step === 3 && <Step4VideoEdit video_url={template.video_url} thumbnail_url={template.thumbnail_url} />}
                        {step === 4 && <Step5Explanation hasTemplate={false} />}

                        <DialogFooter className="flex flex-row items-center">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    Back
                                </Button>
                            )}

                            {step < TOTAL_STEPS ? (
                                <Button type="submit" disabled={isFetchingDetails}>
                                    {isFetchingDetails ? 'Loading...' : 'Next'}
                                </Button>
                            ) : (
                                <Button type="submit" disabled={updateLoading}>
                                    {updateLoading ? 'Saving...' : 'Save Template'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
