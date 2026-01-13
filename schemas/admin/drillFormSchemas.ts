import { z } from 'zod';

export const step1Schema = z.object({
    drill_name: z.string().min(1, "Drill name is required"),
    area: z.enum(["head_position", "back_position", "arm_flexion", "right_knee", "left_knee", "foot_strike"], {
        errorMap: () => ({ message: "Please select a valid area" }),
    }),
    performance_level: z.enum(["poor", "needs improvement", "good", "excellent"], {
        errorMap: () => ({ message: "Please select a valid performance level" }),
    }),
});

export const step2Schema = z.object({
    sets: z
        .number({ invalid_type_error: "Sets is required" })
        .positive({ message: "Sets must be greater than 0" }),
    reps: z
        .number({ invalid_type_error: "Reps is required" })
        .positive({ message: "reps must be greater than 0" }),
    rep_type: z
        .enum(["rep/s", "sec/s", "min/s", "meter/s"], {
            errorMap: () => ({message: "Please select a valid rep type."})
        }),
    frequency: z
        .number({ invalid_type_error: "Frequency is required" })
        .positive({ message: "frequency must be greater than 0" }),
});

export const step3Schema = z.object({
    instructions: z.object({
        steps: z.array(z.string().min(1, "Instruction step cannot be empty"))
            .min(1, "At least one instruction is required")
    })
});

export const step4Schema = z.object({
    video: z.instanceof(File, { message: "A valid video file is required" }),
})

export const step4SchemaEdit = z.object({
    video: z
        .instanceof(File, {message: "A valid video file is required" })
        .optional()
    })

export const step5schema = z.object({
    justification: z.string().optional(),
    reference: z.string().optional()
})

export const fullFormSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .merge(step5schema);

// export types for each schema
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step4EditFormData = z.infer<typeof step4SchemaEdit>;
export type Step5FormData = z.infer<typeof step5schema>;
export type FullFormData = z.infer<typeof fullFormSchema>;