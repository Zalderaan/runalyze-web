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

// icons
import { Edit } from "lucide-react";
import { useState } from "react";

// forms imports
import { type FullFormData, step1Schema, step2Schema, step3Schema, step4SchemaEdit, step5schema } from "@/schemas/admin/drillFormSchemas";
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

    const { updateDrill, updateLoading, updateError } = useUpdateDrill();

    const TOTAL_STEPS = 5;
    const stepSchemas = {
        1: step1Schema,
        2: step2Schema,
        3: step3Schema,
        4: step4SchemaEdit,
        5: step5schema
    }

    // get current values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepDefaults: Record<number, any> = {
        1: {
            drill_name: drill.drill_name,
            area: drill.area,
            performance_level: drill.performance_level
        },
        2: {
            sets: drill.sets,
            reps: drill.reps,
            rep_type: drill.rep_type,
            frequency: drill.frequency
        },
        3: { instructions: drill.instructions }, // Add step 3 default values when you define the schema
        4: { video: undefined }, // Add step 4 default values when you define the schema
        5: { justification: drill.justification, reference: drill.reference }
    }

    const currentSchema = stepSchemas[step as keyof typeof stepSchemas] as z.ZodTypeAny;
    const defaultValues = stepDefaults[step];

    const form = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onSubmit",
        defaultValues
    });

    async function onStepSubmit(values: z.infer<typeof currentSchema>) {
        // console.log('values: ', values);
        // console.log('formData: ', formData);
        const updatedData = { ...formData, ...values }
        setFormData(updatedData);
        // console.log('updated: ', updatedData)
        // move to the next step
        if (step < TOTAL_STEPS) {
            const nextStep = step + 1;
            setFormData(updatedData);
            setStep(nextStep);
            // Merge all previous data with the next step's defaults
            form.reset({ ...stepDefaults[nextStep], ...updatedData });
            return;
        } else {
            // Prepare FormData for file upload
            const formPayload = new FormData();
            Object.entries(updatedData).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === "instructions") {
                        formPayload.append("instructions", JSON.stringify(value));
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formPayload.append(key, value as any);
                    }
                }
            });

            try {
                await updateDrill(formPayload, drill.id);
                // console.log('This is formPayload: ', updatedData);
                // console.log("Update drill submitted");

                // const response = await fetch("/api/admin/drills", {
                //     method: "POST",
                //     body: formPayload,
                // });
                // if (!response.ok) {
                //     let errorMsg = "Failed to submit drill";
                //     try {
                //         const errorData = await response.json();
                //         errorMsg = `${errorData.message}: ${errorData.error}` || errorMsg;
                //         console.error("Backend error: ", errorData);
                //     } catch (parseErr) {
                //         console.error("Error parsing backend error: ", parseErr)
                //     }
                //     setSubmitError(errorMsg); // <-- set error here
                //     return;
                // }
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
                    <form onSubmit={form.handleSubmit(onStepSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Update Drill</DialogTitle>
                            <DialogDescription>Update an existing drill (Step {step} of {TOTAL_STEPS})</DialogDescription>
                        </DialogHeader>

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

                        {step === 1 && <Step1BasicInfo />}
                        {step === 2 && <Step2TrainingParameters />}
                        {step === 3 && <Step3Instructions />}
                        {step === 4 && <Step4VideoEdit video_url={drill.video_url} />}
                        {step === 5 && <Step5Explanation />}

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