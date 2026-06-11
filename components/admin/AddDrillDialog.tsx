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

// Icons
import { Plus } from "lucide-react";

// Forms imports
import {
    step1Schema, step2Schema, step3Schema, step3SchemaWithTemplate, step4Schema, step4SchemaEdit, step5schema,
    type FullFormData,
} from "@/schemas/admin/drillFormSchemas"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2TrainingParameters } from "./Step2TrainingParameters";
import { useState } from "react";
import { Step3Instructions } from "./Step3Instructions";
import { Step4Video } from "./Step4Video";
import { useDrills } from "@/hooks/drills/use-drills";
import { Step5Explanation } from "./Step5Explanation";
import { type DrillTemplate } from "@/hooks/drills/use-drill-templates";

export function AddDrillDialog({ onSuccess, defaultTemplate }: { onSuccess: () => void, defaultTemplate?: DrillTemplate }) {
    const { addDrill, addLoading, addError } = useDrills();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FullFormData>>({});
    const [isOpen, setIsOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Track the selected template so we can pass data to steps 3 & 5
    const [selectedTemplate, setSelectedTemplate] = useState<DrillTemplate | null>(defaultTemplate || null);
    const hasTemplate = selectedTemplate !== null;

    // When a template is selected, step 4 (video) is skipped
    const TOTAL_STEPS = hasTemplate ? 4 : 5;


    // Step schemas
    const step4SchemaForMode = hasTemplate ? step4SchemaEdit : step4Schema;
    const stepSchemas: Record<number, z.ZodTypeAny> = hasTemplate
        ? { 1: step1Schema, 2: step2Schema, 3: step3SchemaWithTemplate, 4: step5schema }
        : { 1: step1Schema, 2: step2Schema, 3: step3Schema, 4: step4SchemaForMode, 5: step5schema };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepDefaults: Record<number, any> = hasTemplate
        ? {
            1: { drill_name: selectedTemplate?.name ?? "", area: undefined, performance_level: undefined, template_id: selectedTemplate?.id },
            2: { sets: undefined, reps: undefined, frequency: undefined, is_high_impact: false },
            3: { has_instructions_override: false },
            4: { justification: "", reference: "", has_justification_override: false }
        }
        : {
            1: { drill_name: "", area: undefined, performance_level: undefined },
            2: { sets: undefined, reps: undefined, frequency: undefined, is_high_impact: false },
            3: { instructions: { steps: [] } },
            4: { video: undefined },
            5: { justification: "", reference: "" }
        };

    const currentSchema = stepSchemas[step as keyof typeof stepSchemas] as z.ZodTypeAny;
    const defaultValues = stepDefaults[step];

    const form = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onSubmit",
        defaultValues
    });

    const formValues = form.watch();
    const formErrors = form.formState.errors;
    console.log("[AddDrillDialog LOG] Step:", step, "TOTAL_STEPS:", TOTAL_STEPS, "hasTemplate:", hasTemplate);
    console.log("[AddDrillDialog LOG] Form Values:", formValues);
    console.log("[AddDrillDialog LOG] Form Errors:", formErrors);

    function handleTemplateSelected(template: DrillTemplate | null) {
        setSelectedTemplate(template);
        // Reset to step 1 if template selection changes (to avoid stale form data)
        if (step > 1) {
            setStep(1);
            setFormData({});
        }
    }

    async function onStepSubmit(values: z.infer<typeof currentSchema>) {
        console.log("[AddDrillDialog LOG] onStepSubmit called on step:", step, "with values:", values);
        const updatedData = { ...formData, ...values };
        setFormData(updatedData);

        if (step < TOTAL_STEPS) {
            setStep((prev) => prev + 1);
        } else {
            // Final step — build FormData and submit
            const formPayload = new FormData();
            Object.entries(updatedData).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                if (key === "instructions" || key === "instructions_override") {
                    formPayload.append(key, JSON.stringify(value));
                } else if (key === "has_instructions_override" || key === "has_justification_override") {
                    // Internal toggle state — don't send to API
                    return;
                } else if (key === "video" || key === "thumbnail") {
                    // Files
                    if (value instanceof File) {
                        formPayload.append(key, value);
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formPayload.append(key, value as any);
                }
            });

            try {
                await addDrill(formPayload);
                onSuccess?.();
                resetDialog();
            } catch (error) {
                setSubmitError(error instanceof Error ? error.message : String(error));
                console.error(error);
            }
        }
    }

    function prevStep() {
        setStep((prev) => prev - 1);
    }

    function resetDialog() {
        setIsOpen(false);
        setStep(1);
        setFormData({});
        setSelectedTemplate(null);
        form.reset();
        setSubmitError(null);
    }

    // Determine which step component to render
    function renderStep() {
        // Template mode: steps are 1=Basic, 2=Training, 3=Instructions, 4=Explanation
        if (hasTemplate) {
            if (step === 1) return <Step1BasicInfo onTemplateSelected={handleTemplateSelected} fixedTemplate={defaultTemplate} />;
            if (step === 2) return <Step2TrainingParameters />;
            if (step === 3) return (
                <Step3Instructions
                    hasTemplate={hasTemplate}
                    templateInstructions={selectedTemplate?.instructions}
                />
            );
            if (step === 4) return (
                <Step5Explanation
                    hasTemplate={hasTemplate}
                    templateJustification={selectedTemplate?.justification}
                    templateReference={selectedTemplate?.reference}
                />
            );
        }

        // New drill mode: original 5-step flow
        if (step === 1) return <Step1BasicInfo onTemplateSelected={handleTemplateSelected} fixedTemplate={defaultTemplate} />;
        if (step === 2) return <Step2TrainingParameters />;
        if (step === 3) return <Step3Instructions hasTemplate={false} />;
        if (step === 4) return <Step4Video />;
        if (step === 5) return <Step5Explanation hasTemplate={false} />;
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex flex-row items-center justify-center w-fit bg-palette-mint-white text-palette-navy hover:bg-palette-mint-white/90 border border-palette-turquoise/30 font-semibold shadow-sm transition-all duration-200">
                    <Plus />
                    Add Drill
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <FormProvider {...form}>
                    <form 
                        onSubmit={form.handleSubmit(
                            onStepSubmit,
                            (errors) => console.log("[AddDrillDialog LOG] Validation failed:", errors)
                        )} 
                        className="space-y-4"
                    >
                        <DialogHeader>
                            <DialogTitle>Add Drill</DialogTitle>
                            <DialogDescription>
                                {hasTemplate
                                    ? `Assigning "${selectedTemplate?.name}" template (Step ${step} of ${TOTAL_STEPS})`
                                    : `Add a new drill to be suggested for users (Step ${step} of ${TOTAL_STEPS})`
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {renderStep()}

                        {submitError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {submitError}
                            </div>
                        )}

                        {addError && (
                            <div className="text-red-600 text-sm mt-2 px-4">
                                {addError}
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
                                    disabled={addLoading}
                                >
                                    {addLoading ? 'Adding drill...' : 'Add drill'}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}