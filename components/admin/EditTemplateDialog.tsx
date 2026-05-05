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
import { useState } from "react";
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

export function EditTemplateDialog({ template, onSuccess }: { template: DrillTemplate, onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    
    const { updateTemplate, updateLoading, updateError } = useUpdateDrillTemplate();

    const TOTAL_STEPS = 4;
    const stepSchemas = {
        1: step1TemplateSchema,
        2: step3Schema,
        3: step4SchemaEdit,
        4: step5schema
    };

    const stepDefaults: Record<number, any> = {
        1: { drill_name: template.name },
        2: { instructions: template.instructions },
        3: { video: undefined },
        4: { justification: template.justification, reference: template.reference }
    };

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
            setStep(nextStep);
            form.reset({ ...stepDefaults[nextStep], ...updatedData });
        } else {
            const formPayload = new FormData();
            
            // Map drill_name to name for the API
            if (updatedData.drill_name) {
                formPayload.append("name", updatedData.drill_name);
            }
            if (updatedData.instructions) {
                formPayload.append("instructions", JSON.stringify(updatedData.instructions));
            }
            if (updatedData.justification) {
                formPayload.append("justification", updatedData.justification);
            }
            if (updatedData.reference) {
                formPayload.append("reference", updatedData.reference);
            }
            if (updatedData.video) {
                formPayload.append("video", updatedData.video);
            }
            if (updatedData.thumbnail) {
                formPayload.append("thumbnail", updatedData.thumbnail);
            }

            try {
                await updateTemplate(formPayload, template.id);
                onSuccess?.();
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
        setStep((prev) => prev - 1);
    }

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
                                <Button type="submit">Next</Button>
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
