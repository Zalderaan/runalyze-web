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
    step1Schema, step2Schema,
    type FullFormData,
    step3Schema,
    step4Schema
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

export function AddDrillDialog({ onSuccess }: { onSuccess: () => void }) {
    const { addDrill, addLoading, addError } = useDrills();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FullFormData>>({});
    const [isOpen, setIsOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const TOTAL_STEPS = 4;

    const stepSchemas = {
        1: step1Schema,
        2: step2Schema,
        3: step3Schema,
        4: step4Schema
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepDefaults: Record<number, any> = {
        1: { drill_name: "", area: undefined, performance_level: undefined },
        2: { sets: undefined, reps: undefined, frequency: undefined },
        3: { instructions: "" }, // Add step 3 default values when you define the schema
        4: { video: undefined }, // Add step 4 default values when you define the schema
    }

    const currentSchema = stepSchemas[step as keyof typeof stepSchemas] as z.ZodTypeAny;
    const defaultValues = stepDefaults[step];

    const form = useForm({
        resolver: zodResolver(currentSchema),
        mode: "onSubmit",
        defaultValues
    })

    async function onStepSubmit(values: z.infer<typeof currentSchema>) {
        // console.log('values: ', values);
        // console.log('formData: ', formData);
        const updatedData = { ...formData, ...values }
        setFormData(updatedData);
        // console.log('updated: ', updatedData)
        // move to the next step
        if (step < TOTAL_STEPS) {
            // form.reset();
            setStep((prev) => prev + 1);
            // submit to backend
            // close
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
                await addDrill(formPayload);

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
                setSubmitError(null);
            } catch (error) {
                setSubmitError(error instanceof Error ? error.message : String(error));
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
                    <Plus />
                    Add Drill
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onStepSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add Drill</DialogTitle>
                            <DialogDescription>Add a new drill to be suggested for users (Step {step} of 4)</DialogDescription>
                        </DialogHeader>

                        {step === 1 && <Step1BasicInfo />}
                        {step === 2 && <Step2TrainingParameters />}
                        {step === 3 && <Step3Instructions />}
                        {step === 4 && <Step4Video />}

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