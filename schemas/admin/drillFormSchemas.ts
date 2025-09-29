import { z } from 'zod';

export const step1Schema = z.object({
    drill_name: z.string().min(1, "Drill name is required"),
    area: z.enum(["head_position", "back_position", "arm_swing", "right_knee", "left_knee", "foot_strike"], {
        errorMap: () => ({ message: "Please select a valid area" }),
    }),
    performance_level: z.enum(["Poor", "Needs Improvement"], {
        errorMap: () => ({ message: "Please select a valid performance level" }),
    }),
});

export const step2Schema = z.object({
    sets: z
        .number({ invalid_type_error: "Sets is required" })
        .positive({ message: "Sets must be greater than 0" }),
    reps: z
        .number({ invalid_type_error: "Sets is required" })
        .positive({ message: "Sets must be greater than 0" }),
    frequency: z
        .number({ invalid_type_error: "Sets is required" })
        .positive({ message: "Sets must be greater than 0" }),
});

export const step3Schema = z.object({
    instructions: z.string().min(1, "Instructions required")
})

export const step4Schema = z.object({
    video: z.instanceof(File, { message: "A valid video file is required" }),
})


export const fullFormSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema);

// export types for each schema
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type FullFormData = z.infer<typeof fullFormSchema>;