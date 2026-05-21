import { z } from 'zod';

export const step1Schema = z.object({
    // If template_id is set, we're reusing an existing template
    template_id: z.number().optional(),
    drill_name: z.string().min(1, "Drill name is required"),
    area: z.enum(["head_position", "back_position", "arm_flexion", "right_knee", "left_knee", "foot_strike"], {
        errorMap: () => ({ message: "Please select a valid area" }),
    }),
    performance_level: z.enum(["poor", "needs_improvement", "good", "excellent"], {
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
    is_high_impact: z.boolean().optional(),
});

export const step3Schema = z.object({
    instructions: z.object({
        steps: z.array(z.string().min(1, "Instruction step cannot be empty"))
            .min(1, "At least one instruction is required")
    }).optional(),
    // Override instructions for a specific assignment (when reusing a template)
    instructions_override: z.object({
        steps: z.array(z.string().min(1, "Instruction step cannot be empty"))
    }).optional(),
    // Whether the user has enabled the override toggle
    has_instructions_override: z.boolean().optional(),
});

export const step3SchemaWithTemplate = z.object({
    instructions: z.any().optional(),
    instructions_override: z.object({
        steps: z.array(z.string().min(1, "Instruction step cannot be empty"))
    }).optional(),
    has_instructions_override: z.boolean().optional(),
});

export const step4Schema = z.object({
    video: z.instanceof(File, { message: "A valid video file is required" }),
    thumbnail: z.instanceof(File).optional(),
})

export const step4SchemaEdit = z.object({
    video: z
        .instanceof(File, {message: "A valid video file is required" })
        .optional(),
    thumbnail: z.instanceof(File).optional(),
})

export const step5schema = z.object({
    justification: z.string().optional(),
    reference: z.string().optional(),
    // Override justification for a specific assignment (when reusing a template)
    justification_override: z.string().optional(),
    has_justification_override: z.boolean().optional(),
})

export const fullFormSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .merge(step5schema);

// Template-only flow: video is not required when selecting an existing template
export const fullFormSchemaWithTemplate = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(z.object({ video: z.instanceof(File).optional() }))
    .merge(step5schema);

// export types for each schema
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type Step4EditFormData = z.infer<typeof step4SchemaEdit>;
export type Step5FormData = z.infer<typeof step5schema>;
export type FullFormData = z.infer<typeof fullFormSchema>;
export type FullFormDataWithTemplate = z.infer<typeof fullFormSchemaWithTemplate>;